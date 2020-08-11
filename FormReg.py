from flask import Flask, render_template,request,redirect
import json
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os, uuid
from collections import Counter


app = Flask(__name__)

def listtodict(A, dic):
   dic = dict(A)
   return dic
# Home================================================================================================================================
@app.route("/")
def home():
    return render_template("Index.html")

@app.route("/DashBoard")
def DashBoard():
    return render_template("DashBoard.html")
# Load Grid ===========================================================================================================================
JsonResult=None

 #blob_service_client = BlobServiceClient.from_connection_string('DefaultEndpointsProtocol=https;AccountName=checklistform;AccountKey=dpZeiTIELCgVGxRxqYkhqAx42b8pWND2onchJ83+yXgHqbkMkPS5aKbmmVMtdDJdENFmmH3EuHhANmUQ02d7TQ==;EndpointSuffix=core.windows.net')

@app.route("/LoadGridFromBlob",methods=['GET','POST'])
def LoadGridFromBlob():
    resp = request.form
    global blob_service_client
    blob_service_client = BlobServiceClient.from_connection_string(resp['ConnectionStr'])

    container_client = blob_service_client.get_container_client(resp["Container"])

    analysed_Json = []
    blob_list = container_client.list_blobs()
    for blob in blob_list:
        analysed_Json.append(blob.name)
    global fileName
    if  resp["blob"] =="":
        fileName = analysed_Json[0]
    else:
        fileName =  resp['blob']


    download_stream = container_client.download_blob(fileName)
    jsonData = download_stream.readall()
    result = json.loads(jsonData)
    global JsonResult
    JsonResult=result
    fields = result['analyzeResult']['documentResults'][0]['fields']

    q = []
    a = []
    Name = result['analyzeResult']['documentResults'][0]['fields']['Name']
    Name = get_key(fields,Name)
    NameValue = result['analyzeResult']['documentResults'][0]['fields']['Name']['text']
    q.append(Name)
    a.append(NameValue)

    Name = result['analyzeResult']['documentResults'][0]['fields']['Employee Code']
    Name = get_key(fields,Name)
    NameValue = result['analyzeResult']['documentResults'][0]['fields']['Employee Code']['text']
    q.append(Name)
    a.append(NameValue)

    Name = result['analyzeResult']['documentResults'][0]['fields']['Company']
    Name = get_key(fields,Name)
    NameValue = result['analyzeResult']['documentResults'][0]['fields']['Company']['text']
    q.append(Name)
    a.append(NameValue)

    for i in range(1, 19, 1):
            if i != 14:
                Name = result['analyzeResult']['documentResults'][0]['fields']['question' + str(i)]
                Name = get_key(fields,Name)
                NameValue = result['analyzeResult']['documentResults'][0]['fields']['question' + str(i)]['text']
                q.append(Name)
                a.append(NameValue)

    for i in range(1, 19, 1):
        Name = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]
        for i in range(1, 19, 1):
            Name = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]
            if Name != None:
                Name = get_key(fields,Name)
                NameValue = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]['text']
                q.append(Name)
                a.append(NameValue)
            else:
                    result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)] = {'type': 'string',
                                                                                                  'valueString': 'Y',
                                                                                                  'text': 'Y',
                                                                                                  'page': 1,
                                                                                                  'boundingBox': [],
                                                                                                  'confidence': 0,
                                                                                                  'elements': []}

                    NameValue = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]['text']
            q.append('answer' + str(i))
            a.append(NameValue)

    finalData = dict(zip(q, a))

    GridList = {}
    data2 = []

    data2.append({'id': "1", 'Labels': "Name", 'question': "Name", 'answer': finalData['Name']})
    data2.append({'id': "2", 'Labels': "Company", 'question': "Company", 'answer': finalData['Company']})
    data2.append(
        {'id': "3", 'Labels': "Employee Code", 'question': "Employee Code", 'answer': finalData['Employee Code']})
    for d in range(1, 19, 1):
        if d != 14:
            data2.append({'id': "" + str(d), 'Labels': "answer" + str(d), 'question': finalData['question' + str(d)],
                          'answer': finalData['answer' + str(d)]})
    GridList["FileName"] = analysed_Json
    GridList['GridData'] = data2
    print(GridList)
    return GridList


@app.route("/GetAllBlob",methods=['GET','POST'])
def GetAllBlob():
    resp = request.form

    blob_service_clients = BlobServiceClient.from_connection_string(resp['ConnectionStr'])

    container_client = blob_service_clients.get_container_client(resp["Container"])
    analysed_Json = []
    q = []
    a = []
    blob_list = container_client.list_blobs()
    for blob in blob_list:
        analysed_Json.append(blob.name)

    len_list = len(analysed_Json)
    finalData = {}
    UpdatedDate = []

    for l in range(0, len_list, 1):

        fileName = analysed_Json[l]
        download_stream = container_client.download_blob(fileName)
        jsonData = download_stream.readall()
        result = json.loads(jsonData)
        fields = result['analyzeResult']['documentResults'][0]['fields']

        UpdatedDate.append(result['lastUpdatedDateTime'][0:-10])
        for i in range(1, 19, 1):
            if i != 14:
                Name = result['analyzeResult']['documentResults'][0]['fields']['question' + str(i)]
                Name = get_key(fields, Name)
                NameValue = result['analyzeResult']['documentResults'][0]['fields']['question' + str(i)]['text']
                q.append(Name)
                a.append(NameValue)

        for s in range(1, 19, 1):
            Name = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(s)]

            if Name != None:

                Name = get_key(fields, Name)
                NameValue = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(s)]['text']
                q.append(Name)
                a.append(NameValue)
            else:
                result['analyzeResult']['documentResults'][0]['fields']['answer' + str(s)] = {'type': 'string',
                                                                                              'valueString': 'Y',
                                                                                              'text': 'Y',
                                                                                              'page': 1,
                                                                                              'boundingBox': [],
                                                                                              'confidence': 0,
                                                                                              'elements': []}
                NameValue = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(s)]['text']
                q.append('answer' + str(s))
                a.append(NameValue)

        finalData[analysed_Json[l]] = (dict(zip(q, a)))

    # JobDescription,HMT,Lightning,Noise =[],[],[],[]
    JobDescription = []
    HMT = []
    Lighting = []
    Noise = []

    for l in range(0, l, 1):
        data = finalData[analysed_Json[l]]
        for i in range(1, 5, 1):
            if 'answer' + str(i) in data:
                JobDescription.append(data['answer' + str(i)])

        for i in range(6, 10, 1):
            if 'answer' + str(i) in data:
                HMT.append(data['answer' + str(i)])

        for i in range(11, 15, 1):
            if 'answer' + str(i) in data:
                Lighting.append(data['answer' + str(i)])

        for i in range(16, 19, 1):
            if 'answer' + str(i) in data:
                Noise.append(data['answer' + str(i)])

    Category = ["JobDescription", "HMT", "Lighting", "Noise"]
    Checked = [JobDescription.count('Y'), HMT.count('Y'), Lighting.count('Y'), Noise.count('Y')]

    Category_total = ["JobDescription_total", "HMT_total", "Lighting_total", "Noise_total"]
    Checked_total = [len(JobDescription), len(HMT), len(Lighting), len(Noise)]

    date_ = list(set(UpdatedDate))
    DateCount = []
    for i in range(0, len(date_), 1):
        DateCount.append({"date": date_[i], "steps": list(dict(Counter(UpdatedDate)).values())[i]})

    output = ["Total", "Checked", "Date", "DateCountList"]
    output_total = [dict(zip(Category_total, Checked_total)), (dict(zip(Category, Checked))), list(set(UpdatedDate)),
                    DateCount]

    ChartData = (dict(zip(output, output_total)))
    return ChartData


@app.route("/UpdateJsonToBlob",methods=['POST'])
def UpdateJsonToBlob():
    resp = request.form
    global JsonResult
    result = JsonResult
    dataList={}
    resp=listtodict(resp,dataList)
    result['analyzeResult']['documentResults'][0]['fields'][resp['Labels']]['text'] = resp['answer']
    result['analyzeResult']['documentResults'][0]['fields'][resp['Labels']]['valueString'] = resp['answer']
    EditedResult=result
    blob_client = blob_service_client.get_container_client("editedjson")
    blob_client.upload_blob(fileName, json.dumps(result), overwrite=True)
    return resp

def get_key(fields,val):
    for key, value in fields.items():
        if val == value:
            return key
    return "key doesn't exist"


if __name__ == '__main__':
    app.run(debug=True)