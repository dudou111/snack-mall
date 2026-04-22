import { useCallback } from 'react';
import { message, Modal } from 'antd';
import { DeleteTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';
import { request3 } from '@/store/modules/doctor';
import { useDispatch } from 'react-redux';
import type { StoreDispatch } from '@/store';

interface Keys {
    selectedRowKeys:React.Key[]
    getTabData:()=>void
}

export default function Model(props: Keys) {
    // 获取仓库状态
    const dispatch: StoreDispatch = useDispatch();

    const [modal, contextHolder] = Modal.useModal();
    const confirm = useCallback(async () => {
        await modal.confirm({
            title: '删除确认',
            icon: <ExclamationCircleOutlined />,
            content: '删除后无法恢复，请确认删除此条信息吗？',
            okText: '确认',
            cancelText: '取消',
            centered: true,
            onOk() {

                dispatch(request3({ id: props.selectedRowKeys }));
                props.getTabData()

                message.success('删除成功');

            },
        });
    }, [dispatch, modal, props]);



    return (
        <>
            <DeleteTwoTone
                onClick={confirm}
                style={{ transform: 'scale(1.4)' }}
            />
            {contextHolder}
        </>
    );
}
