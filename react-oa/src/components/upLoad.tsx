import { Upload, message } from 'antd';

function AvatarUpload() {
  const handleFileChange = (info: any) => {
    if (info.file.status === 'done') {
      // 头像上传成功的处理逻辑
      message.success('头像上传成功');
    } else if (info.file.status === 'error') {
      // 头像上传失败的处理逻辑
      message.error('头像上传失败');
    }
  };

  return (
    <div>
      <Upload
        accept="image/*"
        action="/upload/avatar"
        onChange={handleFileChange}
      >
        {/* <Button icon={<UploadOutlined />}>上传头像</Button> */}
      </Upload>
    </div>
  );
}

export default AvatarUpload;
