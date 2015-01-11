node-omron-hvc-c-test
====
nodejsを使ったオムロンHVC-C1Bの制御テスト

* OMRON HVC-C1B
  * [http://plus-sensing.omron.co.jp/egg-project/product/](http://plus-sensing.omron.co.jp/egg-project/product/)

* コマンド仕様書
  * http://plus-sensing.omron.co.jp/product/files/HVC-C1B_%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%88%E3%82%99%E4%BB%95%E6%A7%98%E6%9B%B8_A.pdf

environment
----
次の組み合わせで動作確認しています。

  * Ubuntu 14.04.1 LTS
  * Buffalo BSBT4D09BK (USBのBluetoothアダプタ。BLE対応)

how to use
----
<pre>
$ sudo apt-get install nodejs npm
$ sudo apt-get install bluetooth bluez-utils libbluetooth-dev
$ sudo npm install noble
$ sudo npm install lodash

$ sudo hciconfig 
hci1:   Type: BR/EDR  Bus: USB
        BD Address: 00:1B:DC:06:77:50  ACL MTU: 310:10  SCO MTU: 64:8
        UP RUNNING PSCAN
        RX bytes:187936 acl:2927 sco:0 events:8046 errors:0
        TX bytes:35285 acl:1666 sco:0 commands:913 errors:0

hci0:   Type: BR/EDR  Bus: USB
        BD Address: C8:F7:33:A0:B0:17  ACL MTU: 310:10  SCO MTU: 64:8
        UP RUNNING PSCAN
        RX bytes:212612 acl:32 sco:0 events:10041 errors:0
        TX bytes:3514 acl:30 sco:0 commands:192 errors:0

  #### hci0 : built-in bluetooth adaptor
  #### hci1 : Buffalo BSBT4D09BK

$ sudo hciconfig hci0 down

$ sudo hcitool -i hci1 lescan
LE Scan ...
??:??:??:??:??:?? (unknown)
??:??:??:??:??:?? omron_hvc_
??:??:??:??:??:?? (unknown)
??:??:??:??:??:?? omron_hvc_
   .
   .
   .
(ctrl+c)

$ sudo nodejs execute.js
HVC-C is found! uuid=????????????, localName=omron_hvc_
connect... : uuid=????????????
hvcc_send_cmd() : buf=fe000000
hvcc_version() : str=HVC-C1B     , major_version=1, minor_version=1, release_version=150, rev=090000
hvcc_send_cmd() : buf=fe01010000
hccv_execute()
hvcc_send_cmd() : buf=fe030300fc0100
hccv_execute() : response_code = 0
{
    "body": [],
    "hand": [],
    "face": [
        {
            "x": 479,
            "y": 279,
            "size": 126,
            "confidence": 713,
            "dir": {
                "yaw": 10,
                "pitch": -9,
                "roll": 4,
                "confidence": 645
            },
            "age": {
                "age": 31,
                "confidence": 222
            },
            "gen": {
                "gender": "male",
                "confidence": 1000
            },
            "gaze": {
                "gazeLR": 9,
                "gazeUD": -24
            },
            "blink": {
                "ratioL": 550,
                "ratioR": 510
            },
            "exp": {
                "expression": "anger",
                "score": 38,
                "degree": -74
            }
        }
    ]
}
  .
  .
  .
</pre>

