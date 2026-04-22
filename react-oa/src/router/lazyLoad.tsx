import { LazyExoticComponent, Suspense } from 'react';
import Spinner from '@/components/spinner';

function lazyLoad(Comp: LazyExoticComponent<() => JSX.Element>) {
    return (
        <Suspense fallback={<Spinner />}>
            <Comp />
        </Suspense>
    );
}
export default lazyLoad;
