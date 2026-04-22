
import style from '../assets/styles/CardBox.module.scss'
import type { FC } from "react";


interface Props{
    title:string,
    children: JSX.Element;
}

const CardBox:FC<Props> = (props) => {
    return (
        <div>
            <div className={ style.detailsTop }>
                <div className={style.credBoxTop}>{props.title}</div>
                <div className={style.detailsTopContent}>
                    {props.children}
                </div>
            </div>
        </div>
    )    
}

export default CardBox;