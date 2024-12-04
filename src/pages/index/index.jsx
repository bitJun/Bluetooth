import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  Text,
  ScrollView
} from '@tarojs/components';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import bluetoothIcon from '@images/bluetooth.png';
import checkIcon from '@images/check.png';
import uncheckIcon from '@images/uncheck.png';
// import {
//   updateDeviceInfo
// } from '@stores/actions/device'
// import { useDispatch } from 'react-redux';
import { set as setGlobalData, get as getGlobalData } from '@config/global';
import {
  queryVerifyToken
} from '@api';
import './index.scss';

const Bluetooth = () => {
  // const dispatch = useDispatch();
  const [devices, setDevices] = useState([]);
  const [devicesId, setDevicesId] = useState(null);
  const [isDiscovery, setIsDiscovery] = useState(false);
  const [discoveryMsg, setDiscoveryMsg] = useState('');
  const [deviceInfo, setDevicesInfo] = useState({});
  const [safeHeight, setSafeHeight] = useState(0);
  const [safeArea, setSafeArea] = useState(0);
  const list = useRef([]);

  useDidShow(() => {
    onVerifyToken();
  })

  const onVerifyToken = () => {
    queryVerifyToken({})
      .then(res=>{
        console.log('res', res);
      })
  }
  
  useEffect(()=>{
    getSystemInfo();
    discoveryBlueToothDevices();
  }, []);

  useEffect(()=>{
    if (!isDiscovery) {
      console.log('list.current', list.current)
      setDevices(list.current);
    }
  }, [list.current, isDiscovery]);

  const getSystemInfo = () => {
    Taro.getSystemInfoAsync({
      success(res) {
        let rate = res.safeArea.width / 750;
        let safeArea = res.safeArea.bottom - res.safeArea.height;
        let height = res.screenHeight - res.screenTop - safeArea - 120 * rate;
        setSafeHeight(height);
        setSafeArea(safeArea);
      },
    });
  };

  const enableBlueTooth = async() => {
    try{
      let state = false;
      await Taro.openBluetoothAdapter()
        .then((res)=>{
          // console.log('初始化蓝牙成功',res);
          state = true;
        });
      return state;
    } catch(error) {
      // console.log(error);
      return false;
    }
  }

  const discoveryBlueToothDevices = async() => {
    Taro.showLoading({
      title: '蓝牙设备搜索ing',
      icon: 'loading'
    });
    let state = await enableBlueTooth();
    // if(!state) {
    //   Taro.showModal({
    //     title: '系统提示',
    //     content: '抱歉手机蓝牙未开启，请开启蓝牙后进行搜索！',
    //     showCancel: false,
    //     success (res) {
    //       Taro.hideLoading({});
    //     }
    //   });
    // } else {
      //#region 
      // 监听扫描到新设备事件
      Taro.onBluetoothDeviceFound((res) => {
        try{
          let arr = res.devices.filter(item=>{
            // return item.connectable && item.name && item.localName.indexOf('DT-GW500') != -1
            return item.connectable && item.name && item.localName.indexOf('DT-GW500') != -1
          });
          list.current = [...list.current, ...arr]
        }catch(e) {
        }
      });

      // 开始搜索附近的蓝牙外围设备
      try {
        Taro.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: false,
          success: (res) => {
            setIsDiscovery(true);
            setDiscoveryMsg('正在搜寻附近的蓝牙外围设备...')
          },
          fail: (res) =>{
          }
        });
      } catch(e) {
        // console.log(e);
        if(isDiscovery) {
          Taro.stopBluetoothDevicesDiscovery({
            fail:(res) => {
              setIsDiscovery(false);
              Taro.hideLoading({});
            },
            complete:(res) =>{
              setIsDiscovery(false);
              Taro.hideLoading({});
            }
          });
        }
      }
      //搜索10秒，超时停止蓝牙搜索
      setTimeout(()=>{
        Taro.stopBluetoothDevicesDiscovery({
          success: (res) => {
            let msg = '';
            if(devices.length == 0) {
              msg = "抱歉，没有匹配到符合条件的设备！";
            }
            setIsDiscovery(false);
            setDiscoveryMsg(msg);
            Taro.hideLoading({});
            // console.log('停止搜寻附近的蓝牙外围设备...');
          }
        });
      }, 2000);
    // }
  }

  const onChooseDevice = (obj) => {
    setDevicesId(obj.deviceId);
    setDevicesInfo(obj);
  }

  const onConnectDevice = () => {
    if (!devicesId) {
      Taro.showToast({
        title: '请先选择需要链接的蓝牙设备',
        icon: 'none'
      })
      return;
    }
    // dispatch(updateDeviceInfo(deviceInfo));
    setGlobalData('deviceInfo', deviceInfo);
    Taro.navigateTo({
      url: `/pages/detail/index?deviceId=${deviceInfo.deviceId}`
    });
    // Taro.navigateTo({
    //   url: `/pages/list/index?deviceId=${deviceInfo.deviceId}`
    // });
  }

  return (
    <View>
      <ScrollView
        className='bluetooth'
        style={{
          height: `${safeHeight}px`
        }}
        scrollY={true}
      >
        {
          devices.map(item=>
            <View
              className='bluetoothBox'
              onClick={()=>{onChooseDevice(item)}}
            >
              <Image
                src={bluetoothIcon}
                className='bluetoothBoxIcon'
                mode='widthFix'
              />
              <View className='bluetoothBoxMain'>
                <View className='bluetoothBoxMainName'>{item.localName}</View>
                <View className='bluetoothBoxMainId'>
                  设备ID: <Text className='bluetoothBoxMainDesc'>{item.deviceId}</Text>
                </View>
                {/* <View className='bluetoothBoxMainUUID'>
                  UUID: <Text className='bluetoothBoxMainDesc'>{item.device_uuid}</Text>
                </View> */}
                <View className='bluetoothBoxMainRSSI'>
                  RSSI: <Text className='bluetoothBoxMainDesc'>{item.RSSI}</Text>
                </View>
              </View>
              <Image
                src={item.deviceId == devicesId ? checkIcon : uncheckIcon}
                className='bluetoothBoxChecked'
              />
            </View>
          )
        }
      </ScrollView>
      <View
        className='connect'
        onClick={()=>{onConnectDevice()}}
        style={{
          bottom: `${safeArea}px`
        }}
      >
        确认连接
      </View>
    </View>
  )
}

export default Bluetooth
