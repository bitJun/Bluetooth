import React, { useEffect, useState, useRef, useMemo } from "react";
import { View, Image, ScrollView } from "@tarojs/components";
import Taro, { useDidShow, useDidHide, useRouter } from "@tarojs/taro";
import useSyncState from '@utils/hooks';
import {
  ab2hex,
  stringToBuffer,
  splitStringByTwoStrict,
  hours,
  minuite,
  second
} from '@utils/util';
import {
  queryVerifyToken
} from '@api';
import {
  Overlay,
  Switch
} from '@nutui/nutui-react-taro';
import "./index.scss";

const List = () => {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState(null);
  const [id, setId] = useState('TTE0101DT2405000001');
  const [focused, setFocused] = useState(false);
  const [bluetoothInfo, setBluetoothInfo] = useSyncState({});
  const [safeHeight, setSafeHeight] = useState(0);
  const [safeArea, setSafeArea] = useState(0);
  const list = useRef([]);
  const info = useRef({
    '1B': '',
    '10': '',
    '11': '',
    '12': '',
    '13': '',
    '23': '',
    '14': '',
    '25': '',
    '24': '',
    '1A': '',
    '17': '',
    '19': '',
    '15': '',
    '1C': '',
    '22': ''
  })
  const [writeId, setWriteId] = useState(null);
  const [characteristicsId, setCharacteristicsId] = useState(null);
  const read = useRef(null);
  const characteristic = useRef(null);

  useDidShow(() => {
    onVerifyToken();
  })

  const onVerifyToken = () => {
    queryVerifyToken({})
      .then(res=>{
        console.log('res', res);
      })
  }

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

  useEffect(() => {
    getSystemInfo();
    let params = router.params;
    console.log('params', params)
    if (params.deviceId) {
      setDeviceId(params.deviceId)
    }
  }, []);

  useEffect(()=>{
    if (deviceId) {
      onConnectDevice();
    }
  }, [deviceId]);

  useDidHide(()=>{
    Taro.closeBLEConnection({
      deviceId: deviceId,
    })
  })

  const onConnectDevice = () => {
    Taro.createBLEConnection({
      deviceId: deviceId,
      success: function(res) {
        Taro.getBLEDeviceServices({
          deviceId: deviceId,
          success: function(json) {
            onLoadDeviceCharacteristics(json.services[0].uuid)
          }
        })
      }
    })
  }

  const onLoadDeviceCharacteristics = (servicesId) => {
    console.log('servicesId', servicesId)
    setWriteId(servicesId);
    read.current = servicesId;
    // 获取特征值
    Taro.getBLEDeviceCharacteristics({
      deviceId: deviceId,
      serviceId: servicesId,
      success: function(res) {
        setCharacteristicsId(res.characteristics[0].uuid);
        characteristic.current = res.characteristics[0].uuid
        res.characteristics.forEach(item=>{
          if (item.properties.write) {
            setWriteId(servicesId);
          }
          if (item.properties.notify) {
            onReadBLECharacteristicValue();
            Taro.notifyBLECharacteristicValueChange({
              deviceId: deviceId,
              serviceId: servicesId,
              characteristicId: item.uuid,
              state: true,
              success(json) {
                onMonitor();
              },
              fail: function(err) {
              }
            })
          }
        })
      }
    });
  }

  /**
   * 监听低功耗蓝牙设备的特征值变化
   */
  const onMonitor = () => {
    Taro.onBLECharacteristicValueChange((res)=>{
      let arr = splitStringByTwoStrict(ab2hex(res.value).toLocaleUpperCase());
      console.log('arr', arr)
      let key = arr[1];
      let value = parseInt(arr[3], 16);
      let val = {...info.current};
      val[key] = value;
      info.current = val;
      // console.log('info.current', info.current)
      setBluetoothInfo(val)
    })
  }

  const onReadBLECharacteristicValue = () => {
    let str = `AA-46464646464646464646464646464646-01-02-0D`;
    console.log('str', str)
    Taro.writeBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: read.current,
      characteristicId: characteristic.current,
      value: stringToBuffer(str),
      complete: function(json) {
        console.log('read', json)
      }
    })
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
        {/* {
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
        } */}
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
  );
};

export default List;
