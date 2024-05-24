import React, { useEffect, useState, useRef } from 'react';
import { View } from '@tarojs/components';
import Taro, {
  useDidShow
} from '@tarojs/taro'
import { Button } from "@nutui/nutui-react-taro";
import './index.scss'

function Index() {
  const [devicesList, setDevicesList] = useState([]);
  const [chs, setChs] = useState([]);
  const [connected, setConnected] = useState(false);
  const [discoveryStarted, setDiscoveryStarted] = useState(false);
  const list = useRef([]);
  
  useDidShow(()=>{
    onInitBluetooth();
  }, []);

  const onInitBluetooth = () => {
    Taro.openBluetoothAdapter({
      success: function () {
        console.log('蓝牙模块初始化成功');
        // 开始搜索蓝牙设备
        onSearchDevices();
      },
      fail: function (err) {
        console.error('蓝牙模块初始化失败', err);
      }
    });
  }

  const onSearchDevices = () => {
    Taro.startBluetoothDevicesDiscovery({
      success: function () {
        console.log('开始搜索蓝牙设备');
        // 假设搜索时间为 5 秒
        setTimeout(function () {
          // 获取搜索到的蓝牙设备列表
          onLoadDevices();
        }, 4000);
      },
      fail: function (err) {
        console.error('开始搜索蓝牙设备失败', err);
      }
    });
  }

  const onLoadDevices = () => {
    Taro.getBluetoothDevices({
      success: function (res) {
        console.log('搜索到的蓝牙设备列表：', res);
        // 停止搜索蓝牙设备
        Taro.stopBluetoothDevicesDiscovery({
          success: function () {
            console.log('停止搜索蓝牙设备');
            // 连接蓝牙设备
            var deviceId = res.devices[0].deviceId; // 假设连接第一个搜索到的设备
            Taro.createBLEConnection({
              deviceId: deviceId,
              success: function (res) {
                console.log('连接蓝牙设备成功：', res);
                // 断开蓝牙连接
                Taro.closeBLEConnection({
                  deviceId: deviceId,
                  success: function () {
                    console.log('断开蓝牙连接成功');
                    // 关闭蓝牙模块
                    Taro.closeBluetoothAdapter({
                      success: function () {
                        console.log('蓝牙模块关闭成功');
                      }
                    });
                  }
                });
              },
              fail: function (err) {
                console.error('连接蓝牙设备失败', err);
              }
            });
          },
          fail: function (err) {
            console.error('停止搜索蓝牙设备失败', err);
          }
        });
      },
      fail: function (err) {
        console.error('获取搜索到的蓝牙设备列表失败', err);
      }
    });
  }

  const onConnect = (deviceId) => {
    Taro.createBLEConnection({
      deviceId,
      success: function(res) {
        setConnected(true);
        console.log(res)
      }
    })
  }

  return (
    <View>
      <View className="index">
        欢迎使用 NutUI React 开发 Taro 多端项目。
      </View>
      <View className="index">
        <Button type="primary" className="btn">
          搜索蓝牙设备
        </Button>
      </View>
      <View className='list'>
        {
          devicesList.map(item=>
            <View
              className='item'
              key={item.deviceId}
              onClick={()=>{createBLEConnection(item)}}
            >
              {item.name}
            </View>
          )
        }
      </View>
    </View>
  )
}

export default Index
