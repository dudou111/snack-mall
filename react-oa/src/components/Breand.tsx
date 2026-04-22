import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { matchRoutes } from 'react-router';
import { routes } from '../router';
import { useMemo } from 'react';

import type { BreadcrumbProps } from 'antd';
type Item = Required<BreadcrumbProps>['items'][number];

export default function Breand() {
    const location = useLocation();

    const items: Item[] = useMemo(() => {
        // 1.获取location在routes中匹配的所有route
        const matchroutes = matchRoutes(routes, location);

        // 2.对匹配的route组成的数组进行构建为面包屑的item
        const res = matchroutes
            ?.map(({ route, pathname }) => {
                if (route.meta?.title) {
                    return {
                        pathname,
                        title: route.meta?.title,
                    };
                } else {
                    return null! as Item;
                }
            })
            .filter((x) => !!x);

        // 3.给不是最后一个的item的title属性添加Link标签。
        return res?.map((x, i) => {
            return i === res.length - 1
                ? x
                : {
                      ...x,
                      title: <Link to={(x as any).pathname}>{x.title}</Link>,
                  };
        });
    }, [location])!;

    return (
        // 面包屑
        <>
            <Breadcrumb style={{ margin: '16px 16px' }} items={items} />
        </>
    );
}
