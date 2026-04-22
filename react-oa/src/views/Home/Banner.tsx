import React from 'react';
import { Carousel, ConfigProvider } from 'antd';
import styles from '@/assets/styles/home/home.module.scss';

// 导入图片 - 使用正确的导入方式
import banner2Jpg from '@/assets/images/banner2.jpg';
import banner3Jpg from '@/assets/images/banner3.jpg';
import banner4Jpg from '@/assets/images/banner4.jpg';

// 可选：WebP格式图片
import banner2WebP from '@/assets/images/banner2.webp';
import banner3WebP from '@/assets/images/banner3.webp';
import banner4WebP from '@/assets/images/banner4.webp';

const Banner: React.FC = () => {
  // 检测浏览器是否支持webp
  const supportsWebP = () => {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  };

  // 根据浏览器支持选择图片格式
  const useWebP = typeof window !== 'undefined' ? supportsWebP() : false;

  // 主要轮播图片 - 确保是数组
  const bannerImages = useWebP 
    ? [banner2WebP, banner3WebP, banner4WebP]
    : [banner2Jpg, banner3Jpg, banner4Jpg];

  // 轮播图设置
  const carouselSettings = {
    autoplay: true,
    effect: 'fade' as const,
    dots: true,
    infinite: true,
    speed: 300,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    className: styles.carousel,
    lazyLoad: 'progressive' as const
  };

  return (
    <div className={styles.bannerContainer}>
      <ConfigProvider
        theme={{
          components: {
            Carousel: {
              dotWidth: 10,
              dotHeight: 10,
              dotActiveWidth: 24,
            },
          },
        }}
      >
        <Carousel {...carouselSettings}>
          {bannerImages.map((src, index) => (
            <div key={index} className={styles.carouselItem}>
              <img
                src={src}
                alt={`零食商城Banner ${index + 1}`}
                className={styles.bannerImage}
                loading="lazy"
              />
            </div>
          ))}
        </Carousel>
      </ConfigProvider>
    </div>
  );
};

export default Banner; 