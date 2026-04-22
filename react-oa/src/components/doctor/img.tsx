import { Space, Image} from 'antd';
import {
    DownloadOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    SwapOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
} from '@ant-design/icons';


interface Avatar{
    avatar:string
}

export default function Img(props:Avatar) {
    const onDownload = () => {
        fetch(props.avatar)
            .then((response) => response.blob())
            .then((blob) => {
                const url = URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.download = 'image.png';
                document.body.appendChild(link);
                link.click();
                URL.revokeObjectURL(url);
                link.remove();
            });
    };

    return (
        <>
            <Image
                width={30}
                style={{ borderRadius: '15px' }}
                src={props.avatar}
                preview={{
                    toolbarRender: (
                        _,
                        {
                            transform: { scale },
                            actions: {
                                onFlipY,
                                onFlipX,
                                onRotateLeft,
                                onRotateRight,
                                onZoomOut,
                                onZoomIn,
                            },
                        }
                    ) => (
                        <Space size={12} className="toolbar-wrapper">
                            <DownloadOutlined onClick={onDownload} />
                            <SwapOutlined rotate={90} onClick={onFlipY} />
                            <SwapOutlined onClick={onFlipX} />
                            <RotateLeftOutlined onClick={onRotateLeft} />
                            <RotateRightOutlined onClick={onRotateRight} />
                            <ZoomOutOutlined
                                disabled={scale === 1}
                                onClick={onZoomOut}
                            />
                            <ZoomInOutlined
                                disabled={scale === 50}
                                onClick={onZoomIn}
                            />
                        </Space>
                    ),
                }}
            />
        </>
    );
}
