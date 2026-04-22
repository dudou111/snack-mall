import React from 'react';
import {  Space, Spin } from 'antd';
import "@/assets/styles/global.scss"

const Spinner: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%',minHeight:'360px',display:'flex',justifyContent:'center',alignItems:'center' }}>
      <Spin tip="加载中..." size="large">
        <div className="content" />
      </Spin>
  </Space>
);

export default Spinner;
