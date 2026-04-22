import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Table, Space, Tag } from 'antd';
import type { PaginationProps } from 'antd';
import { EditTwoTone } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import Model from './model';
import Img from './img';

import { request } from '@/store/modules/doctor';
import { useDispatch, useSelector } from 'react-redux';
import type { StoreState, StoreDispatch } from '@/store';

interface DataType {
    key: React.Key | any;
    Doctorname: string;
    avatar: string;
    Courtyardarea: string;
    Doctorjob: string;
    Department: string;
    Tags: string[];
    Doctorcontent: string;
}

interface Props {
    dataSource: any[];
    doctornum: number;
    getTabData: () => void;
    selectedRowKeys: React.Key[];
    onSelectChange: (newSelectedRowKeys: React.Key[]) => void;
}

const DoctorTable: React.FC<Props> = (props: Props) => {
    // 表格
    const columns: ColumnsType<DataType> = [
        {
            width: '60px',
            title: '医生姓名',
            align: 'center',
            sorter: true,
            dataIndex: 'Doctorname',
        },
        {
            width: '60px',
            title: '医生头像',
            align: 'center',
            sorter: true,
            dataIndex: 'avatar',
            render: (_, record) => {
                return (
                    <>
                        <Img avatar={record.avatar} />
                    </>
                );
            },
        },
        {
            width: '60px',
            title: '院区',
            align: 'center',
            sorter: true,
            dataIndex: 'Courtyardarea',
        },
        {
            width: '80px',
            title: '职称',
            align: 'center',
            sorter: true,
            dataIndex: 'Doctorjob',
        },
        {
            width: '80px',
            title: '科室',
            align: 'center',
            sorter: true,
            dataIndex: 'Department',
        },
        {
            width: '150px',
            title: '标签',
            align: 'center',
            sorter: true,
            dataIndex: 'Tags',
            render: (text) => {
                return (
                    <>
                        <Space size={10} wrap>
                            <Tag color="success">{text[0]}</Tag>
                            <Tag color="processing">{text[1]}</Tag>
                            <Tag color="error">{text[2]}</Tag>
                        </Space>
                    </>
                );
            },
        },
        {
            width: '120px',
            title: '医生简介',
            align: 'center',
            sorter: true,
            dataIndex: 'Doctorcontent',
            render: (text) => {
                return (
                    <>
                        <span
                            style={{
                                display: ' -webkit-box',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                WebkitLineClamp: '2',
                            }}
                        >
                            {text}
                        </span>
                    </>
                );
            },
        },
        {
            width: '100px',
            title: '操作',
            align: 'center',
            sorter: true,
            dataIndex: 'operate',
            render: (_, record) => {
                return (
                    <>
                        <Space size={30}>
                            <Link
                                to={'/Hospitalmsg/Doctor/DoctorEdit'}
                                state={{record}}
                            >
                                <EditTwoTone
                                    style={{ transform: 'scale(1.5)' }}
                                />
                            </Link>
                            <Model
                                selectedRowKeys={props.selectedRowKeys}
                                getTabData={props.getTabData}
                            />
                        </Space>
                    </>
                );
            },
        },
    ];

    // 获取仓库状态
    const dispatch: StoreDispatch = useDispatch();

    // 获取分页
    useSelector((state: StoreState) => state.doctor.doctornum);

    const onChangepage: PaginationProps['onChange'] = useCallback(
        (page: number, pageSize: number) => {
            // dispatch(request({ offset: (page - 1) * page }));
            dispatch(request({ offset: (page - 1) * pageSize }));

            console.log('Page: ', page);
            console.log('pageSize: ', pageSize);
        },
        [dispatch]
    );

    const rowSelection: TableRowSelection<DataType> = {
        selectedRowKeys: props.selectedRowKeys,
        onChange: props.onSelectChange,
        selections: [Table.SELECTION_ALL, Table.SELECTION_NONE],
    };

    return (
        <>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={props.dataSource}
                pagination={{
                    showQuickJumper: true,
                    showSizeChanger: true,
                    pageSizeOptions: [5,10],
                    responsive: true,
                    total: props.doctornum,
                    onChange: onChangepage,
                }}
            />
        </>
    );
};
export default DoctorTable;
