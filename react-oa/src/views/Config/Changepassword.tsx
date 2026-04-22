// 仓库
import { useSelector, useDispatch } from 'react-redux'
// 
import type { StoreState, StoreDispatch } from '../../store'

// 
import {changedata } from '../../store/modules/user'


import React, { useState,useRef, useEffect } from 'react';
import { Upload,Button } from 'antd';
import type { RcFile} from 'antd/es/upload/interface';




const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};



const Changepassword: React.FC = () => {


  const userInfo = useSelector((state: StoreState) => state.user.userInfo)
  const avatar = useSelector((state: StoreState) => state.user.userInfo?.avatar)

  const dispatch: StoreDispatch = useDispatch();

  useEffect(() => {
    
    if (userInfo!=null) {
      console.log("头像修改",userInfo.avatar);
    
      setImageUrl(avatar!)
    }
  },[userInfo])

  const [imageUrl, setImageUrl] = useState<string>(avatar!);


  // 存储file
  const fileref = useRef<any>()

  // 选中头像但还未上传
  const handleChange = (info: any) => {

    fileref.current = info.file
    getBase64(info.file as RcFile, (url) => {
        setImageUrl(url);
        
    });
    
  };


  // 确认修改
  const handleUpload = () => {
    
    const formdata = new FormData()
    formdata.append("avatar", fileref.current);
    // 派发任务
    dispatch(changedata(formdata))

    

  };

  // token请求头
  const tokenObj = {
    'authorization' : 'Bearer ' + localStorage.getItem('token')
  }
  return (
    <>
      <Upload
        style={{width:150,height:150}}
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="/api/auth/changedata"
        method='post'
        // withCredentials={true}
        // 后台接收的文件名
        name="avatar"
        headers={tokenObj}
        // 而外携带的参数
        data={{ test: 123, name: '456' }}
        beforeUpload={() => false}
        // customRequest={handleCustomRequest}
        onChange={handleChange}
      >
      <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
      </Upload>
      <Button onClick={handleUpload}>保存</Button>
      <Button>取消</Button>
    </>
  );
};

export default Changepassword