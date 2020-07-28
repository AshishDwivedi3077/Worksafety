from flask import Flask, render_template,request,redirect
import json
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os, uuid

app = Flask(__name__)

def listtodict(A, dic):
   dic = dict(A)
   return dic
# Home================================================================================================================================
@app.route("/")
def home():
    return render_template("Index.html")
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
    q.append("FileName");
    # a.append(analysed_Json[int(resp['page'])])
    a.append(analysed_Json)

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

    for i in range(1, 14, 1):
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
                                                                                              'valueString': '✔',
                                                                                              'text': '✔', 'page': 1,
                                                                                              'boundingBox': [],
                                                                                              'confidence': 0,
                                                                                              'elements': []}

                Name = get_key(fields,Name)
                NameValue = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]['text']
                q.append(Name)
                a.append(NameValue)

    # a_file = open("templates/JsonData/Result-WorkspaceInspection"+ str(resp['page']) +".json", "w")
    # json.dump(result, a_file)
    # a_file.close()

    finalData = dict(zip(q, a))
    return finalData


@app.route("/UpdateJsonToBlob",methods=['POST'])
def UpdateJsonToBlob():
    resp = request.form
    global JsonResult
    result = JsonResult
    print(result)
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