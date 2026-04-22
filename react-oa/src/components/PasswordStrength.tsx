import React from 'react';
import { Progress } from 'antd';

interface PasswordStrengthProps {
    password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    const calculateStrength = (pwd: string): { score: number; text: string; color: string } => {
        if (!pwd) return { score: 0, text: '请输入密码', color: '#d9d9d9' };

        let score = 0;
        
        // 长度检查
        if (pwd.length >= 8) score += 25;
        if (pwd.length >= 12) score += 15;
        
        // 包含小写字母
        if (/[a-z]/.test(pwd)) score += 15;
        
        // 包含大写字母
        if (/[A-Z]/.test(pwd)) score += 15;
        
        // 包含数字
        if (/\d/.test(pwd)) score += 15;
        
        // 包含特殊字符
        if (/[^a-zA-Z0-9]/.test(pwd)) score += 15;

        if (score < 30) return { score, text: '弱', color: '#ff4d4f' };
        if (score < 60) return { score, text: '中等', color: '#faad14' };
        if (score < 80) return { score, text: '强', color: '#52c41a' };
        return { score, text: '很强', color: '#1890ff' };
    };

    const strength = calculateStrength(password);

    if (!password) return null;

    return (
        <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#666', minWidth: 60 }}>密码强度:</span>
                <Progress 
                    percent={strength.score} 
                    showInfo={false} 
                    strokeColor={strength.color}
                    size="small"
                    style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, color: strength.color, minWidth: 30 }}>
                    {strength.text}
                </span>
            </div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                建议: 至少8位，包含大小写字母、数字和特殊字符
            </div>
        </div>
    );
};

export default PasswordStrength; 