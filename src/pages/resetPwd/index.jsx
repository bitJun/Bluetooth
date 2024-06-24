import React, { useEffect, useState, useRef } from "react";
import { View, Image, Input, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
// import { NavBar } from "@components";
import Logo from '@images/logo.png';
import clearIcon from '@images/clearIcon.png';
import hideIcon from '@images/hide.png';
import showIcon from '@images/show.png';
import { setStorageSync } from "@utils/util";
import {
  postMiniLogin,
  postUpdatePassword
} from '@api';
import "./index.scss";

const ResetPwd = () => {
  let [systemInfo, setSystemInfo] = useState({});
  let [rate, setRate] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [accountParams, setAccountParams] = useState({
    username: '',
    password: '',
    oldpassword: '',
    confirmpassword: ''
  });
  const [focusInfo, setFocusInfo] = useState({
    username: false,
    password: false,
    oldpassword: false,
    confirmpassword: false
  });
  const [showPassword, setShowPassword] = useState({
    username: true,
    password: true,
    oldpassword: true,
    confirmpassword: true
  });

  useEffect(() => {
    if (accountParams.username && accountParams.password && accountParams.oldpassword && accountParams.confirmpassword) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [accountParams]);

  useEffect(() => {
    getSystemInfo();
  }, []);

  const getSystemInfo = () => {
    Taro.getSystemInfoAsync({
      success(res) {
        setSystemInfo(res);
        setRate(res.safeArea.width / 750);
      },
    });
  };

  const onChange = (type, event) => {
    let value = event.detail.value;
    let data = { ...accountParams };
    data[type] = value;
    setAccountParams(data);
  };

  const onClear = (key) => {
    let data = { ...accountParams };
    data[key] = "";
    setAccountParams(data);
  };

  const onLogin = () => {
    if (!accountParams.username) {
      Taro.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }
    if (!accountParams.oldpassword) {
      Taro.showToast({
        title: '请输入j旧密码',
        icon: 'none'
      });
      return;
    }
    if (!accountParams.password) {
      Taro.showToast({
        title: '请输入新密码',
        icon: 'none'
      });
      return;
    }
    if (!accountParams.confirmpassword) {
      Taro.showToast({
        title: '请输入新密码',
        icon: 'none'
      });
      return;
    }
    if (accountParams.confirmpassword != accountParams.password) {
      Taro.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      });
      return;
    }
    else {
      postUpdatePassword(accountParams)
        .then(res=>{
          console.log('res', res);
          setStorageSync('accessToken', res.token);
          setStorageSync('userInfo', res.userInfo);
          Taro.navigateTo({
            url: '/pages/index/index'
          })
        })
        .catch(err=>{
          console.log('err',err)
        })
    }
  };

  const onShowPwd = (key,event) => {
    event.stopPropagation();
    let data = { ...showPassword };
    if (data[key]) {
      data[key] = false;
    } else {
      data[key] = true;
    }
    setShowPassword(data);
  };

  const onFocus = (key) => {
    let data = { ...focusInfo };
    data[key] = true;
    setFocusInfo(data);
  };

  const onBlur = (key) => {
    let data = { ...focusInfo };
    data[key] = false;
    setFocusInfo(data);
  };

  const forgetPwd = () => {
    // Taro.navigateTo({
    //   url: ''
    // })
  }

  return (
    <>
      <View className="bgMask"></View>
      <View
        style={{
          width: "100%",
          left: 0,
          position: "absolute",
          top: `calc(${systemInfo?.safeArea?.top}px + ${88 * rate}px)`,
          zIndex: 9,
        }}
      >
        <View className="loginView">
          <Image
            src={Logo}
            className="loginViewLogo"
            mode="aspectFit"
            lazyLoad={true}
          />
          {/* <View className="loginViewTitle">欢迎</View> */}
          <View className="loginViewMain">
            <View className="loginViewForm">
              <View className="loginViewFormControl">
                <Input
                  value={accountParams.username}
                  placeholder="请输入用户名"
                  placeholderClass="placeholder"
                  className={`${
                    accountParams.username
                      ? "loginViewFormControlValue"
                      : "loginViewFormControlNoValue"
                  }`}
                  onInput={(e) => {
                    onChange("username", e);
                  }}
                  cursor={accountParams.username.toString().length}
                  controlled={true}
                  maxlength={50}
                  onFocus={() => {
                    onFocus("username");
                  }}
                  onBlur={() => {
                    onBlur("username");
                  }}
                />
                {accountParams.username && focusInfo.username ? (
                  <View
                    className="loginViewFormControlAction"
                    onClick={() => {
                      onClear("username");
                    }}
                  >
                    <Image
                      src={clearIcon}
                      className="loginViewFormControlActionImg"
                      mode="widthFix"
                      lazyLoad={true}
                    />
                  </View>
                ) : null}
              </View>
              <View className="loginViewFormControl loginViewFormControlPass">
                <Input
                  className="loginViewFormControlValue"
                  value={accountParams.oldpassword}
                  placeholder="请输入旧密码"
                  placeholderClass="placeholder"
                  password={showPassword.oldpassword}
                  onInput={(e) => {
                    onChange("oldpassword", e);
                  }}
                  cursor={accountParams.oldpassword.toString().length}
                  controlled={true}
                  maxlength={50}
                  onFocus={() => {
                    onFocus("oldpassword");
                  }}
                  onBlur={() => {
                    onBlur("oldpassword");
                  }}
                />
                {accountParams.oldpassword && focusInfo.oldpassword ? (
                  <View
                    className="loginViewFormControlClear"
                    onClick={(e) => {
                      onClear("oldpassword", e);
                    }}
                  >
                    <Image
                      src={clearIcon}
                      className="loginViewFormControlClearIcon"
                      mode="widthFix"
                    />
                  </View>
                ) : null}
                <View
                  className="loginViewFormControlAction"
                  onClick={(e) => {
                    onShowPwd('oldpassword', e);
                  }}
                >
                  <Image
                    src={showPassword.oldpassword ? hideIcon : showIcon}
                    className="loginViewFormControlActionImg w48"
                    mode="widthFix"
                    lazyLoad={true}
                  />
                </View>
              </View>
              <View className="loginViewFormControl loginViewFormControlPass">
                <Input
                  className="loginViewFormControlValue"
                  value={accountParams.password}
                  placeholder="请输入新密码"
                  placeholderClass="placeholder"
                  password={showPassword.password}
                  onInput={(e) => {
                    onChange("password", e);
                  }}
                  cursor={accountParams.password.toString().length}
                  controlled={true}
                  maxlength={50}
                  onFocus={() => {
                    onFocus("password");
                  }}
                  onBlur={() => {
                    onBlur("password");
                  }}
                />
                {accountParams.password && focusInfo.password ? (
                  <View
                    className="loginViewFormControlClear"
                    onClick={(e) => {
                      onClear("password", e);
                    }}
                  >
                    <Image
                      src={clearIcon}
                      className="loginViewFormControlClearIcon"
                      mode="widthFix"
                    />
                  </View>
                ) : null}
                <View
                  className="loginViewFormControlAction"
                  onClick={(e) => {
                    onShowPwd('password', e);
                  }}
                >
                  <Image
                    src={showPassword.password ? hideIcon : showIcon}
                    className="loginViewFormControlActionImg w48"
                    mode="widthFix"
                    lazyLoad={true}
                  />
                </View>
              </View>
              <View className="loginViewFormControl loginViewFormControlPass">
                <Input
                  className="loginViewFormControlValue"
                  value={accountParams.confirmpassword}
                  placeholder="请输入新密码"
                  placeholderClass="placeholder"
                  password={showPassword.confirmpassword}
                  onInput={(e) => {
                    onChange("confirmpassword", e);
                  }}
                  cursor={accountParams.confirmpassword.toString().length}
                  controlled={true}
                  maxlength={50}
                  onFocus={() => {
                    onFocus("confirmpassword");
                  }}
                  onBlur={() => {
                    onBlur("confirmpassword");
                  }}
                />
                {accountParams.confirmpassword && focusInfo.confirmpassword ? (
                  <View
                    className="loginViewFormControlClear"
                    onClick={(e) => {
                      onClear("confirmpassword", e);
                    }}
                  >
                    <Image
                      src={clearIcon}
                      className="loginViewFormControlClearIcon"
                      mode="widthFix"
                    />
                  </View>
                ) : null}
                <View
                  className="loginViewFormControlAction"
                  onClick={(e) => {
                    onShowPwd('confirmpassword', e);
                  }}
                >
                  <Image
                    src={showPassword.confirmpassword ? hideIcon : showIcon}
                    className="loginViewFormControlActionImg w48"
                    mode="widthFix"
                    lazyLoad={true}
                  />
                </View>
              </View>
            </View>
          </View>
          <View
            className={`loginViewFormAction ${
              canSubmit ? 'active' : ""
            }`}
            onClick={() => {
              onLogin();
            }}
          >
            登 录
          </View>
        </View>
      </View>
    </>
  );
};

export default ResetPwd;
