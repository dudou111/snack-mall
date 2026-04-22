import { Button, Form, Input, Cascader,message } from 'antd';
import { useCallback } from 'react';
import { request2, request3 } from '@/store/modules/doctor';
import { useDispatch } from 'react-redux';
import type { StoreDispatch } from '@/store';

const options = [
    {
        value: '内科',
        label: '内科',
        children: [
            { value: '肾内科', label: '肾内科' },
            { value: '神经科', label: '神经科' },
        ],
    },
    {
        value: '外科',
        label: '外科',
        children: [
            { value: '牙科', label: '牙科' },
            { value: '皮肤科', label: '皮肤科' },
        ],
    },
];

interface Props {
    selectedRowKeys: React.Key[];
    getTabData: () => void;
}

export default function DoctorForm(props: Props) {
    const [form] = Form.useForm();

    const dispatch: StoreDispatch = useDispatch();

    const onFinish = useCallback(
        async (rows: any) => {
            // 打印表单数据
            console.log(rows);
            const row = rows.Department.join('-');
            // 在这里可执行提交逻辑，如发起网络请求等
            dispatch(
                request2({
                    key: rows._id,
                    Department: row,
                    Doctorname: rows.Doctorname,
                })
            );
        },
        [dispatch]
    );

    const delall = useCallback(() => {
        dispatch(request3({ id: props.selectedRowKeys }));
        props.getTabData();
        message.success('删除成功');
    }, [dispatch, props]);

    return (
        <Form onFinish={onFinish} layout={'inline'} form={form}>
            <Form.Item
                label="科室"
                name="Department"
                rules={[{ required: true, message: '请选择科室' }]}
                style={{ margin: '0 0 24px' }}
            >
                <Cascader
                    placeholder="请选择科室"
                    allowClear
                    options={options}
                />
            </Form.Item>

            <Form.Item
                label="姓名"
                name="Doctorname"
                rules={[{ required: true, message: '请输入姓名' }]}
                style={{ margin: '0 16px 24px' }}
            >
                <Input placeholder="请输入医生姓名" allowClear />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    搜索
                </Button>
            </Form.Item>

            <Form.Item>
                <Button type="primary" onClick={delall}>
                    批量删除
                </Button>
            </Form.Item>
        </Form>
    );
}
