from flask import Flask, render_template, flash, request, redirect
import json
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, ContentSettings
import os, uuid
import time
from requests import get, post
from collections import Counter
from urllib.request import urlopen
from werkzeug.utils import secure_filename
import validators

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


def listtodict(A, dic):
    dic = dict(A)
    return dic


@app.route("/")
def home():
    return render_template("EditForm.html")


@app.route("/analyseform")
def AnalysedPage():
    return render_template("AnalyseForm.html")


@app.route("/dashboard")
def DashBoard():
    return render_template("DashBoard.html")

def get_key(fields, val):
    for key, value in fields.items():
        if val == value:
            return key
    return "key doesn't exist"


@app.route("/loadgridfromblob", methods=['GET', 'POST'])
def LoadGridFromBlob():
    resp = request.form
    global blob_service_client
    blob_service_client = BlobServiceClient.from_connection_string(resp['ConnectionStr'])

    container_client = blob_service_client.get_container_client(resp["ContainerName"])

    analysed_Json = []
    blob_list = container_client.list_blobs()
    for blob in blob_list:
        analysed_Json.append(blob.name)
    global fileName
    if resp["blob"] == "":
        fileName = analysed_Json[0]
    else:
        fileName = resp['blob']

    download_stream = container_client.download_blob(fileName)
    jsonData = download_stream.readall()
    result = json.loads(jsonData)
    global JsonResult
    JsonResult = result
    IsQA = False
    fields = result['analyzeResult']['documentResults'][0]['fields']

    allkeys = list(fields.keys())
    temp = [x for x in fields if not x.startswith('question')]
    k = [x for x in temp if not x.startswith('answer')]
    label = []
    value = []
    for i in k:
        val = result['analyzeResult']['documentResults'][0]['fields'][i]
        if val != None:
            label.append(i)
            value.append(val['text'])

    queList = [x for x in allkeys if x.startswith('question')]
    ansList = [x for x in allkeys if x.startswith('answer')]

    for i in range(1, len([x for x in fields if x.startswith('question')]), 1):
        if 'question' + str(i) in fields:
            IsQA = True
            # if i != 14:
            Name = result['analyzeResult']['documentResults'][0]['fields']['question' + str(i)]
            Name = get_key(fields, Name)
            NameValue = result['analyzeResult']['documentResults'][0]['fields']['question' + str(i)]['text']
            label.append(Name)
            value.append(NameValue)

    for i in range(1, len([x for x in fields if x.startswith('answer')]), 1):
        Name = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]
        for i in range(1, 19, 1):
            Name = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]
            if Name != None:
                Name = get_key(fields, Name)
                NameValue = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]['text']
                label.append(Name)
                value.append(NameValue)
            else:
                result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)] = {'type': 'string',
                                                                                              'valueString': 'Y',
                                                                                              'text': 'Y',
                                                                                              'page': 1,
                                                                                              'boundingBox': [],
                                                                                              'confidence': 0,
                                                                                              'elements': []}

                NameValue = result['analyzeResult']['documentResults'][0]['fields']['answer' + str(i)]['text']
            label.append('answer' + str(i))
            value.append(NameValue)

    finalData = dict(zip(label, value))
    print(finalData)
    GridList = {}
    data2 = []
    print(k)
    for i in k:
        print(i)
        if i != 'State':
            data2.append({'Label': "" + str(i), "Key": "" + str(i), 'Values': finalData[i]})

    for d in range(1, len(queList), 1):
        if 'question' + str(d) in finalData:
            # if d != 14:
            data2.append({'Label': finalData['question' + str(d)], "Key": "answer" + str(d),
                          'Values': finalData['answer' + str(d)]})
    GridList['IsQA'] = IsQA
    GridList["FileName"] = analysed_Json
    GridList['GridData'] = data2
    GridList['Content'] = fileName

    return GridList


@app.route("/updatejsontoblob", methods=['POST'])
def UpdateJsonToBlob():
    resp = request.form
    global JsonResult
    result = JsonResult
    print(resp['Values'])
    dataList = {}
    resp = listtodict(resp, dataList)
    result['analyzeResult']['documentResults'][0]['fields'][resp['Key']]['text'] = resp['Values']
    result['analyzeResult']['documentResults'][0]['fields'][resp['Key']]['valueString'] = resp['Values']
    EditedResult = result
    blob_client = blob_service_client.get_container_client(resp["EditContainer"])
    blob_client.upload_blob(fileName, json.dumps(result), overwrite=True)
    return resp


UPLOAD_FOLDER = 'uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route("/analysefile", methods=['GET', 'POST'])
def AnalyseFIle():
    resp = request.form
    # blob_service_client = BlobServiceClient.from_connection_string('DefaultEndpointsProtocol=https;AccountName=checklistform;AccountKey=dpZeiTIELCgVGxRxqYkhqAx42b8pWND2onchJ83+yXgHqbkMkPS5aKbmmVMtdDJdENFmmH3EuHhANmUQ02d7TQ==;EndpointSuffix=core.windows.net')
    blob_service_client = BlobServiceClient.from_connection_string(resp['SasID'])
    endpoint = resp['endpointId']  # r"https://checklistformreader.cognitiveservices.azure.com"
    apim_key = resp['ApimkeyId']  # "e8e591d41a0b43bf8f21da161c204ad2"
    model_id = resp['modelId']  # '62a96766-80f6-4c23-867b-af07a527d9da'
    post_url = endpoint + "/formrecognizer/v2.0/custom/models/%s/analyze" % model_id
    blob_client = blob_service_client.get_container_client(resp["ProjectContainerName"])
    file = request.files['file']
    uurl = resp['url']
    analizedforms = resp['AnalyseContName']
    global filename
    global source
    global data_bytes
    result = "";

    try:
        if uurl != '':
            if validators.url(resp['url']) == True:
                filename = os.path.basename(resp['url'])
                source = urlopen(resp['url'])
                data_bytes = source.read()
                my_content_settings = ContentSettings(content_type='application/pdf')
                blob_client.upload_blob(filename, source, overwrite=True, content_settings=my_content_settings)
            else:

                result = "Invalid URL"
                flash(result)
                return redirect('/analyseform')


        else:
            # ---------File Path-----------------

            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            source = 'uploads/' + filename
            if filename[-3:] == "pdf":
                my_content_settings = ContentSettings(content_type='application/pdf')
                with open(source, "rb") as f:
                    blob_client.upload_blob(filename, f, overwrite=True, content_settings=my_content_settings)
            else:
                my_content_settings = ContentSettings(content_type='image/jpeg')

                with open(source, "rb") as f:
                    blob_client.upload_blob(filename, f, overwrite=True, content_settings=my_content_settings)

            with open(source, "rb") as f:
                data_bytes = f.read()
            os.remove("uploads/" + filename)

        params = {
            "includeTextDetails": True
        }
        headers = {
            # Request headers
            'Content-Type': 'application/pdf',
            'Ocp-Apim-Subscription-Key': apim_key,
        }

        resp = post(url=post_url, data=data_bytes, headers=headers, params=params)
        if resp.status_code != 202:
            result = "POST analyze failed"  #
            # print("POST analyze failed:\n%s" % resp.json())
            quit()
        # print("POST analyze succeeded:")
        get_url = resp.headers["operation-location"]
        n_tries = 12
        n_try = 0
        wait_sec = 5
        max_wait_sec = 60
        while n_try < n_tries:
            resp_analised = get(url=get_url, headers={"Ocp-Apim-Subscription-Key": apim_key})
            resp_json = resp_analised.json()
            if resp_analised.status_code != 200:
                result = "GET analyze results failed"
                # print("GET analyze results failed:\n%s" % json.dumps(resp_json))
            status = resp_json["status"]
            if status == "succeeded":
                # print("success")
                global AnaysedData
                AnaysedData = json.dumps(resp_json)
                result = "Analysis succeeded"

            if status == "failed":
                result = "Analysis Failed"

            n_try += 1

        #################--upload JSON--########################################
        blob_client = blob_service_client.get_container_client(analizedforms)
        blob_client.upload_blob("Result-" + filename[:-4] + ".json", AnaysedData, overwrite=True)

    except Exception as e:
        result = "Fail to analyse"

    flash(result)
    return redirect('/analyseform')

@app.route("/getallblob",methods=['GET','POST'])
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
        for i in range(1, len([x for x in fields if x.startswith('question')]), 1):
            # if 'question' + str(i) in result['analyzeResult']['documentResults'][0]['fields']:
            if i != 14:
                Name = result['analyzeResult']['documentResults'][0]['fields']['question' + str(i)]
                Name = get_key(fields, Name)
                NameValue = result['analyzeResult']['documentResults'][0]['fields']['question' + str(i)]['text']
                q.append(Name)
                a.append(NameValue)

        for s in range(1, len([x for x in fields if x.startswith('answer')]), 1):
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
    output_total = [dict(zip(Category_total, Checked_total)), (dict(zip(Category, Checked))), sorted(list(set(UpdatedDate))),
                    DateCount]

    ChartData = (dict(zip(output, output_total)))
    return ChartData

if __name__ == '__main__':
    app.run(debug=True)
