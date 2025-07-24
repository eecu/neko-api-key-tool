import React, { useState, useEffect } from 'react';
import { Button, Input, Typography, Table, Tag, Spin, Card, Collapse, Toast, Space, Tabs, Banner, Avatar } from '@douyinfe/semi-ui';
import { IconCopy, IconDownload, IconSetting, IconKey, IconActivity } from '@douyinfe/semi-icons';
import { useTheme } from '../context/Theme';
import { API, timestamp2string } from '../helpers';
import { stringToColor } from '../helpers/render';
import { ITEMS_PER_PAGE } from '../constants';
import { renderModelPrice, renderQuota } from '../helpers/render';
import Paragraph from '@douyinfe/semi-ui/lib/es/typography/paragraph';
import { Tooltip, Modal } from '@douyinfe/semi-ui';
import Papa from 'papaparse';

const { Text } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

function renderTimestamp(timestamp) {
    return timestamp2string(timestamp);
}

function renderIsStream(bool) {
    if (bool) {
        return <Tag color="blue" size="large">流</Tag>;
    } else {
        return <Tag color="purple" size="large">非流</Tag>;
    }
}

function renderUseTime(type) {
    const time = parseInt(type);
    if (time < 101) {
        return <Tag color="green" size="large"> {time} 秒 </Tag>;
    } else if (time < 300) {
        return <Tag color="orange" size="large"> {time} 秒 </Tag>;
    } else {
        return <Tag color="red" size="large"> {time} 秒 </Tag>;
    }
}

const LogsTable = () => {
    const theme = useTheme();
    const isDark = theme === 'dark';
    
    // 主题适配的样式函数
    const getThemeStyles = () => ({
        bannerBg: isDark 
            ? 'linear-gradient(135deg, #434343 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cardHeaderBg: isDark
            ? 'linear-gradient(90deg, #2a2a2a 0%, #242424 100%)'
            : 'linear-gradient(90deg, #fafafa 0%, #f5f5f5 100%)',
        cardShadow: isDark
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.1)',
        inputBg: isDark ? '#1a1a1a' : '#f8f9fa',
        inputBorder: isDark ? '#404040' : '#e9ecef',
        tipBg: isDark ? '#0d1117' : '#e6f7ff',
        tipBorder: isDark ? '#30363d' : '#91d5ff',
        resultHeaderBg: isDark
            ? 'linear-gradient(90deg, #1a1a1a 0%, #0d1117 100%)'
            : 'linear-gradient(90deg, #f6ffed 0%, #f0f9ff 100%)',
        tabActiveBg: isDark
            ? 'linear-gradient(135deg, #0d1117, #161b22)'
            : 'linear-gradient(135deg, #e6f7ff, #f0f9ff)',
        // 令牌信息卡片背景
        tokenTotalBg: isDark
            ? 'linear-gradient(135deg, #2d1f00, #3d2800)' 
            : 'linear-gradient(135deg, #fff7e6, #fffbe6)',
        tokenTotalBorder: isDark ? '#8b4513' : '#ffd591',
        tokenRemainBg: isDark
            ? 'linear-gradient(135deg, #001529, #003a8c)'
            : 'linear-gradient(135deg, #f6ffed, #f0f9ff)',
        tokenRemainBorder: isDark ? '#1890ff' : '#91d5ff',
        tokenUsedBg: isDark
            ? 'linear-gradient(135deg, #2a0e13, #3d1319)'
            : 'linear-gradient(135deg, #fff1f0, #fff2e8)',
        tokenUsedBorder: isDark ? '#a8071a' : '#ffadd2',
        tokenExpireBg: isDark
            ? 'linear-gradient(135deg, #1f0a2e, #301934)'
            : 'linear-gradient(135deg, #f9f0ff, #f6ffed)',
        tokenExpireBorder: isDark ? '#722ed1' : '#d3adf7',
        exchangeRateBg: isDark
            ? 'linear-gradient(135deg, #002329, #003d52)'
            : 'linear-gradient(135deg, #e6fffb, #f0f9ff)',
        exchangeRateBorder: isDark ? '#13c2c2' : '#87e8de'
    });
    
    // 添加错误边界状态
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isInitializing, setIsInitializing] = useState(true);
    const [apikey, setAPIKey] = useState('');
    const [activeTabKey, setActiveTabKey] = useState('');
    const [tabData, setTabData] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeKeys, setActiveKeys] = useState([]);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const [baseUrl, setBaseUrl] = useState('');
    const [customBaseUrl, setCustomBaseUrl] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    
    // 安全的环境变量初始化
    const getInitialBaseUrls = () => {
        try {
            const envUrl = process.env.REACT_APP_BASE_URL;
            if (!envUrl || !envUrl.trim()) {
                return {}; // 返回空对象，不显示示例界面
            }
            
            const trimmedUrl = envUrl.trim();
            
            // 检查是否是JSON格式
            if (trimmedUrl.startsWith('{') && trimmedUrl.endsWith('}')) {
                try {
                    const parsed = JSON.parse(trimmedUrl);
                    // 验证解析结果是否有效
                    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                        return parsed;
                    }
                } catch (jsonError) {
                    // JSON解析失败，继续尝试简单URL
                }
            }
            
            // 尝试作为简单URL处理
            if (trimmedUrl.startsWith('http')) {
                return { 'NewAPI': trimmedUrl };
            }
            
            return {}; // 返回空对象
        } catch (error) {
            // 任何错误都返回空对象
            return {};
        }
    };
    
    const [baseUrls, setBaseUrls] = useState(() => getInitialBaseUrls());

    useEffect(() => {
        try {
            // 如果没有预设URL，显示自定义输入框
            const keys = Object.keys(baseUrls);
            if (keys.length === 0) {
                setShowCustomInput(true);
                setIsInitializing(false);
                return;
            }
            
            // 默认设置第一个地址为baseUrl
            if (keys.length > 0) {
                const firstKey = keys[0];
                setActiveTabKey(firstKey);
                setBaseUrl(baseUrls[firstKey]);
            }
            setIsInitializing(false);
        } catch (error) {
            console.error('Error in useEffect:', error);
            setHasError(true);
            setErrorMessage('初始化组件时发生错误：' + error.message);
            setIsInitializing(false);
        }
    }, [baseUrls]);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
        setBaseUrl(baseUrls[key]);
    };

    // const testConnection = async (testUrl) => {
    //     console.log('测试连接:', testUrl);
    //     try {
    //         // 简单测试连接
    //         const response = await fetch(testUrl, {
    //             method: 'GET',
    //             mode: 'cors',
    //         });
    //         console.log('连接测试结果:', response.status);
    //         return response.ok;
    //     } catch (error) {
    //         console.error('连接测试失败:', error);
    //         return false;
    //     }
    // };

    const addCustomBaseUrl = async () => {
        if (!customBaseUrl.trim()) {
            Toast.warning('请输入有效的BASE_URL');
            return;
        }
        
        // 验证URL格式
        let testUrl = customBaseUrl.trim();
        try {
            new URL(testUrl);
        } catch (e) {
            Toast.error('请输入有效的URL格式');
            return;
        }
        
        // 移除末尾的斜杠
        if (testUrl.endsWith('/')) {
            testUrl = testUrl.slice(0, -1);
        }
        
        const newKey = `Custom_${Date.now()}`;
        const newBaseUrls = {
            ...baseUrls,
            [newKey]: testUrl
        };
        
        setBaseUrls(newBaseUrls);
        
        // 自动切换到新添加的URL
        setTimeout(() => {
            setActiveTabKey(newKey);
            setBaseUrl(testUrl);
        }, 100);
        
        setCustomBaseUrl('');
        setShowCustomInput(false);
        Toast.success('自定义BASE_URL添加成功并已自动切换！');
    };

    const removeCustomUrl = (key) => {
        const newBaseUrls = { ...baseUrls };
        delete newBaseUrls[key];
        setBaseUrls(newBaseUrls);
        
        // 如果删除的是当前激活的tab，切换到第一个
        if (key === activeTabKey) {
            const remainingKeys = Object.keys(newBaseUrls);
            if (remainingKeys.length > 0) {
                const firstKey = remainingKeys[0];
                setActiveTabKey(firstKey);
                setBaseUrl(newBaseUrls[firstKey]);
            }
        }
        Toast.success('已删除自定义URL');
    };

    // const resetData = (key) => {
    //     setTabData((prevData) => ({
    //         ...prevData,
    //         [key]: {
    //             balance: 0,
    //             usage: 0,
    //             accessdate: "未知",
    //             logs: [],
    //             tokenValid: false,
    //         }
    //     }));
    // };

    const fetchData = async () => {
        console.log('fetchData 开始执行');
        console.log('API密钥:', apikey);
        console.log('BaseURL:', baseUrl);
        
        if (apikey === '') {
            Toast.warning('请先输入令牌，再进行查询');
            return;
        }
        
        if (!baseUrl || baseUrl.trim() === '') {
            Toast.error('请先设置API地址');
            return;
        }
        
        // 智能令牌格式检测
        const tokenLength = apikey.length;
        const tokenPrefix = apikey.substring(0, 10);
        console.log('令牌长度:', tokenLength, '令牌前缀:', tokenPrefix);
        
        // 检测常见的令牌格式
        const isOpenAIFormat = /^sk-[a-zA-Z0-9]{48,}$/.test(apikey);
        const isSessionFormat = /^sess-[a-zA-Z0-9_-]{20,}$/.test(apikey);
        const isCustomFormat = apikey.length >= 20;
        
        if (isOpenAIFormat) {
            console.log('检测到OpenAI格式令牌');
        } else if (isSessionFormat) {
            console.log('检测到Session格式令牌');
        } else if (isCustomFormat) {
            console.log('检测到自定义格式令牌，长度足够');
        } else if (tokenLength < 10) {
            Toast.warning('令牌长度过短，请检查是否完整');
        } else {
            console.log('未知令牌格式，但仍会尝试查询');
        }
        
        console.log('开始查询，设置loading状态');
        setLoading(true);
        let newTabData = { ...tabData[activeTabKey], balance: 0, usage: 0, accessdate: 0, logs: [], tokenValid: false };

        try {
            console.log('开始查询余额信息');
            if (process.env.REACT_APP_SHOW_BALANCE === "true") {
                console.log('SHOW_BALANCE=true，开始查询订阅信息');
                const subscriptionUrl = `${baseUrl}/v1/dashboard/billing/subscription`;
                console.log('订阅查询URL:', subscriptionUrl);
                
                const subscription = await API.get(subscriptionUrl, {
                    headers: { Authorization: `Bearer ${apikey}` },
                });
                console.log('订阅查询成功:', subscription.data);
                
                const subscriptionData = subscription.data;
                newTabData.balance = subscriptionData.hard_limit_usd;
                newTabData.tokenValid = true;

                console.log('开始查询使用情况');
                let now = new Date();
                let start = new Date(now.getTime() - 100 * 24 * 3600 * 1000);
                let start_date = `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`;
                let end_date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
                
                const usageUrl = `${baseUrl}/v1/dashboard/billing/usage?start_date=${start_date}&end_date=${end_date}`;
                console.log('使用量查询URL:', usageUrl);
                
                const res = await API.get(usageUrl, {
                    headers: { Authorization: `Bearer ${apikey}` },
                });
                console.log('使用量查询成功:', res.data);
                
                const data = res.data;
                newTabData.usage = data.total_usage / 100;
            } else {
                console.log('SHOW_BALANCE=false，跳过余额查询');
            }
        } catch (e) {
            console.error('Balance fetch error:', e);
            console.error('错误详情:', e.response?.data);
            console.error('错误状态:', e.response?.status);
            Toast.error(`查询余额失败: ${e.response?.data?.error?.message || e.message}`);
            // 不要立即返回，继续尝试查询日志
        }
        try {
            console.log('开始查询日志详情');
            if (process.env.REACT_APP_SHOW_DETAIL === "true") {
                console.log('SHOW_DETAIL=true，开始查询日志');
                const logUrl = `${baseUrl}/api/log/token?key=${apikey}`;
                console.log('日志查询URL:', logUrl);
                
                const logRes = await API.get(logUrl);
                console.log('日志查询响应:', logRes.data);
                
                const { success, data: logData } = logRes.data;
                if (success) {
                    console.log('日志查询成功，数据长度:', logData?.length);
                    newTabData.logs = logData.reverse();
                    newTabData.tokenValid = true;  // 如果日志查询成功，说明token有效
                    setActiveKeys(['1', '2']); // 自动展开两个折叠面板
                } else {
                    console.log('日志查询失败:', logRes.data);
                    Toast.error('查询调用详情失败，请检查令牌和API地址');
                }
            } else {
                console.log('SHOW_DETAIL=false，跳过日志查询');
            }
        } catch (e) {
            console.error('Log fetch error:', e);
            console.error('错误详情:', e.response?.data);
            console.error('错误状态:', e.response?.status);
            Toast.error(`查询日志失败: ${e.response?.data?.message || e.message}`);
        }
        
        console.log('查询完成，更新数据');
        setTabData((prevData) => ({
            ...prevData,
            [activeTabKey]: newTabData,
        }));
        setLoading(false);
        console.log('查询流程结束');

    };

    const copyText = async (text) => {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                Toast.success('已复制：' + text);
                return;
            }
            
            // Fallback for Safari and older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                textArea.remove();
                Toast.success('已复制：' + text);
            } catch (err) {
                textArea.remove();
                Modal.error({ title: '无法复制到剪贴板，请手动复制', content: text });
            }
        } catch (err) {
            Modal.error({ title: '无法复制到剪贴板，请手动复制', content: text });
        }
    };

    const columns = [
        {
            title: '时间',
            dataIndex: 'created_at',
            render: renderTimestamp,
            sorter: (a, b) => a.created_at - b.created_at,
        },
        {
            title: '令牌名称',
            dataIndex: 'token_name',
            render: (text, record, index) => {
                return record.type === 0 || record.type === 2 ? (
                    <div>
                        <Tag
                            color="grey"
                            size="large"
                            onClick={() => {
                                copyText(text);
                            }}
                        >
                            {' '}
                            {text}{' '}
                        </Tag>
                    </div>
                ) : (
                    <></>
                );
            },
            sorter: (a, b) => ('' + a.token_name).localeCompare(b.token_name),
        },
        {
            title: '模型',
            dataIndex: 'model_name',
            render: (text, record, index) => {
                return record.type === 0 || record.type === 2 ? (
                    <div>
                        <Tag
                            color={stringToColor(text)}
                            size="large"
                            onClick={() => {
                                copyText(text);
                            }}
                        >
                            {' '}
                            {text}{' '}
                        </Tag>
                    </div>
                ) : (
                    <></>
                );
            },
            sorter: (a, b) => ('' + a.model_name).localeCompare(b.model_name),
        },
        {
            title: '用时',
            dataIndex: 'use_time',
            render: (text, record, index) => {
                return record.model_name.startsWith('mj_') ? null : (
                    <div>
                        <Space>
                            {renderUseTime(text)}
                            {renderIsStream(record.is_stream)}
                        </Space>
                    </div>
                );
            },
            sorter: (a, b) => a.use_time - b.use_time,
        },
        {
            title: '提示',
            dataIndex: 'prompt_tokens',
            render: (text, record, index) => {
                return record.model_name.startsWith('mj_') ? null : (
                    record.type === 0 || record.type === 2 ? <div>{<span> {text} </span>}</div> : <></>
                );
            },
            sorter: (a, b) => a.prompt_tokens - b.prompt_tokens,
        },
        {
            title: '补全',
            dataIndex: 'completion_tokens',
            render: (text, record, index) => {
                return parseInt(text) > 0 && (record.type === 0 || record.type === 2) ? (
                    <div>{<span> {text} </span>}</div>
                ) : (
                    <></>
                );
            },
            sorter: (a, b) => a.completion_tokens - b.completion_tokens,
        },
        {
            title: '花费',
            dataIndex: 'quota',
            render: (text, record, index) => {
                return record.type === 0 || record.type === 2 ? <div>{renderQuota(text, 6)}</div> : <></>;
            },
            sorter: (a, b) => a.quota - b.quota,
        },
        {
            title: '详情',
            dataIndex: 'content',
            render: (text, record, index) => {
                let other = null;
                try {
                    if (record.other === '') {
                        record.other = '{}';
                    }
                    other = JSON.parse(record.other);
                } catch (e) {
                    return (
                        <Tooltip content="该版本不支持显示计算详情">
                            <Paragraph
                                ellipsis={{
                                    rows: 2,
                                }}
                            >
                                {text}
                            </Paragraph>
                        </Tooltip>
                    );
                }
                if (other == null) {
                    return (
                        <Paragraph
                            ellipsis={{
                                rows: 2,
                                showTooltip: {
                                    type: 'popover',
                                },
                            }}
                        >
                            {text}
                        </Paragraph>
                    );
                }
                let content = renderModelPrice(
                    record.prompt_tokens,
                    record.completion_tokens,
                    other.model_ratio,
                    other.model_price,
                    other.completion_ratio,
                    other.group_ratio,
                );
                return (
                    <Tooltip content={content}>
                        <Paragraph
                            ellipsis={{
                                rows: 2,
                            }}
                        >
                            {text}
                        </Paragraph>
                    </Tooltip>
                );
            },
        }
    ];

    const copyTokenInfo = (e) => {
        e.stopPropagation();
        const activeTabData = tabData[activeTabKey] || {};
        const { balance, usage, accessdate } = activeTabData;
        const info = `令牌总额: ${balance === 100000000 ? '无限' : `${balance.toFixed(3)}`}
剩余额度: ${balance === 100000000 ? '无限制' : `${(balance - usage).toFixed(3)}`}
已用额度: ${balance === 100000000 ? '不进行计算' : `${usage.toFixed(3)}`}
有效期至: ${accessdate === 0 ? '永不过期' : renderTimestamp(accessdate)}`;
        copyText(info);
    };

    const exportCSV = (e) => {
        e.stopPropagation();
        const activeTabData = tabData[activeTabKey] || { logs: [] };
        const { logs } = activeTabData;
        const csvData = logs.map(log => ({
            '时间': renderTimestamp(log.created_at),
            '模型': log.model_name,
            '用时': log.use_time,
            '提示': log.prompt_tokens,
            '补全': log.completion_tokens,
            '花费': log.quota,
            '详情': log.content,
        }));
        const csvString = '\ufeff' + Papa.unparse(csvData);
        
        try {
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'data.csv';
            
            // For Safari compatibility
            if (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1) {
                link.target = '_blank';
                link.setAttribute('target', '_blank');
            }
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (err) {
            Toast.error('导出失败，请稍后重试');
            console.error('Export failed:', err);
        }
    };

    const activeTabData = tabData[activeTabKey] || { logs: [], balance: 0, usage: 0, accessdate: "未知", tokenValid: false };
    const themeStyles = getThemeStyles();

    const renderContent = () => (
        <>
            {/* 顶部欢迎横幅 */}
            <Banner
                type='info'
                description='🚀 NewAPI密钥检测工具 - 快速检测API密钥的有效性、余额和使用历史'
                style={{ 
                    marginBottom: 20,
                    background: themeStyles.bannerBg,
                    color: 'white',
                    border: 'none'
                }}
                icon={<IconKey style={{ color: 'white' }} />}
            />

            {/* API配置卡片 */}
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconSetting style={{ color: isDark ? '#69c0ff' : '#1890ff' }} />
                        <span style={{ color: isDark ? '#ffffff' : undefined }}>API配置</span>
                    </div>
                }
                headerStyle={{ 
                    borderBottom: `2px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                    background: themeStyles.cardHeaderBg
                }}
                style={{ 
                    marginBottom: 24,
                    boxShadow: themeStyles.cardShadow,
                    borderRadius: '8px'
                }}
            >
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <Avatar 
                            size="small" 
                            style={{ backgroundColor: isDark ? '#52c41a' : '#52c41a' }}
                        >
                            🌐
                        </Avatar>
                        <Text strong style={{ fontSize: '14px' }}>当前API地址：</Text>
                        <Tag 
                            color="blue" 
                            size="large"
                            style={{ 
                                background: isDark 
                                    ? 'linear-gradient(135deg, #1668dc, #1890ff)' 
                                    : 'linear-gradient(135deg, #1890ff, #36cfc9)',
                                border: 'none',
                                color: 'white'
                            }}
                        >
                            {baseUrl || '未设置'}
                        </Tag>
                        <Button 
                            icon={<IconSetting />} 
                            theme="light" 
                            type="primary"
                            onClick={() => setShowCustomInput(!showCustomInput)}
                            style={{ borderRadius: '6px' }}
                        >
                            {showCustomInput ? '隐藏配置' : '自定义地址'}
                        </Button>
                    </div>
                    
                    {showCustomInput && (
                        <div style={{ 
                            display: 'flex', 
                            gap: 12, 
                            marginTop: 16,
                            padding: '16px',
                            background: themeStyles.inputBg,
                            borderRadius: '8px',
                            border: `1px solid ${themeStyles.inputBorder}`
                        }}>
                            <Input
                                placeholder="🔗 输入自定义BASE_URL，例如：https://api.example.com"
                                value={customBaseUrl}
                                onChange={setCustomBaseUrl}
                                style={{ 
                                    flex: 1,
                                    borderRadius: '6px'
                                }}
                                prefix={<span style={{ color: isDark ? '#69c0ff' : '#1890ff' }}>🌐</span>}
                            />
                            <Button 
                                type="primary" 
                                onClick={addCustomBaseUrl}
                                style={{ 
                                    borderRadius: '6px',
                                    background: isDark 
                                        ? 'linear-gradient(135deg, #389e0d, #52c41a)'
                                        : 'linear-gradient(135deg, #52c41a, #73d13d)'
                                }}
                            >
                                ✅ 添加
                            </Button>
                            <Button 
                                onClick={() => {
                                    setShowCustomInput(false);
                                    setCustomBaseUrl('');
                                }}
                                style={{ borderRadius: '6px' }}
                            >
                                ❌ 取消
                            </Button>
                        </div>
                    )}
                    
                    <div style={{ 
                        marginTop: 12, 
                        padding: '8px 12px', 
                        background: themeStyles.tipBg, 
                        borderRadius: '6px',
                        border: `1px solid ${themeStyles.tipBorder}`
                    }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                            💡 <strong>支持格式：</strong> sk-xxx (OpenAI)、sess-xxx (ChatGPT)、或其他NewAPI兼容令牌
                        </Text>
                    </div>
                </div>
                
                <div style={{ position: 'relative' }}>
                    <Input
                        size="large"
                        showClear
                        value={apikey}
                        onChange={(value) => setAPIKey(value)}
                        placeholder="🔑 请输入API令牌进行检测..."
                        prefix={<IconKey style={{ color: isDark ? '#69c0ff' : '#1890ff' }} />}
                        suffix={
                            <Button
                                type='primary'
                                theme="solid"
                                onClick={fetchData}
                                loading={loading}
                                disabled={apikey === ''}
                                style={{ 
                                    borderRadius: '6px',
                                    background: loading ? undefined : (isDark 
                                        ? 'linear-gradient(135deg, #1668dc, #1890ff)'
                                        : 'linear-gradient(135deg, #1890ff, #36cfc9)'),
                                    minWidth: '80px'
                                }}
                            >
                                {loading ? '检测中...' : '🔍 检测'}
                            </Button>
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                fetchData();
                            }
                        }}
                        style={{ 
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}
                    />
                </div>
            </Card>
            {/* 检测结果卡片 */}
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconActivity style={{ color: isDark ? '#73d13d' : '#52c41a' }} />
                        <span style={{ color: isDark ? '#ffffff' : undefined }}>检测结果</span>
                    </div>
                }
                headerStyle={{ 
                    borderBottom: `2px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                    background: themeStyles.resultHeaderBg
                }}
                style={{ 
                    boxShadow: themeStyles.cardShadow,
                    borderRadius: '8px'
                }}
            >
                <Collapse 
                    activeKey={activeKeys} 
                    onChange={(keys) => setActiveKeys(keys)}
                    style={{ background: 'transparent' }}
                >
                    {process.env.REACT_APP_SHOW_BALANCE === "true" && (
                        <Panel
                            header={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '16px', color: '#faad14' }}>💰</span>
                                    <span style={{ fontWeight: 600 }}>令牌信息</span>
                                </div>
                            }
                            itemKey="1"
                            extra={
                                <Button 
                                    icon={<IconCopy />} 
                                    theme='light' 
                                    type='primary' 
                                    onClick={(e) => copyTokenInfo(e)} 
                                    disabled={!activeTabData.tokenValid}
                                    style={{ borderRadius: '6px' }}
                                >
                                    📋 复制信息
                                </Button>
                            }
                        >
                            <Spin spinning={loading}>
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                    gap: '16px',
                                    padding: '16px 0'
                                }}>
                                    <div style={{ 
                                        padding: '16px', 
                                        background: themeStyles.tokenTotalBg,
                                        borderRadius: '8px',
                                        border: `1px solid ${themeStyles.tokenTotalBorder}`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontSize: '20px' }}>💳</span>
                                            <Text strong>令牌总额</Text>
                                        </div>
                                        <Text style={{ fontSize: '18px', color: isDark ? '#ffc53d' : '#fa8c16' }}>
                                            {activeTabData.balance === 100000000 ? "♾️ 无限" : 
                                             activeTabData.balance === "未知" || activeTabData.balance === undefined ? "❓ 未知" : 
                                             `$${activeTabData.balance.toFixed(3)}`}
                                        </Text>
                                    </div>
                                    
                                    <div style={{ 
                                        padding: '16px', 
                                        background: themeStyles.tokenRemainBg,
                                        borderRadius: '8px',
                                        border: `1px solid ${themeStyles.tokenRemainBorder}`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontSize: '20px' }}>💎</span>
                                            <Text strong>剩余额度</Text>
                                        </div>
                                        <Text style={{ fontSize: '18px', color: isDark ? '#69c0ff' : '#1890ff' }}>
                                            {activeTabData.balance === 100000000 ? "♾️ 无限制" : 
                                             activeTabData.balance === "未知" || activeTabData.usage === "未知" || 
                                             activeTabData.balance === undefined || activeTabData.usage === undefined ? "❓ 未知" : 
                                             `$${(activeTabData.balance - activeTabData.usage).toFixed(3)}`}
                                        </Text>
                                    </div>
                                    
                                    <div style={{ 
                                        padding: '16px', 
                                        background: themeStyles.tokenUsedBg,
                                        borderRadius: '8px',
                                        border: `1px solid ${themeStyles.tokenUsedBorder}`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontSize: '20px' }}>📊</span>
                                            <Text strong>已用额度</Text>
                                        </div>
                                        <Text style={{ fontSize: '18px', color: isDark ? '#ff7875' : '#f5222d' }}>
                                            {activeTabData.balance === 100000000 ? "🚫 不计算" : 
                                             activeTabData.usage === "未知" || activeTabData.usage === undefined ? "❓ 未知" : 
                                             `$${activeTabData.usage.toFixed(3)}`}
                                        </Text>
                                    </div>
                                    
                                    <div style={{ 
                                        padding: '16px', 
                                        background: themeStyles.tokenExpireBg,
                                        borderRadius: '8px',
                                        border: `1px solid ${themeStyles.tokenExpireBorder}`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <span style={{ fontSize: '20px' }}>⏰</span>
                                            <Text strong>有效期至</Text>
                                        </div>
                                        <Text style={{ fontSize: '14px', color: isDark ? '#b37feb' : '#722ed1' }}>
                                            {activeTabData.accessdate === 0 ? '♾️ 永不过期' : 
                                             activeTabData.accessdate === "未知" ? '❓ 未知' : 
                                             renderTimestamp(activeTabData.accessdate)}
                                        </Text>
                                    </div>
                                </div>
                            </Spin>
                        </Panel>
                    )}
                    {process.env.REACT_APP_SHOW_DETAIL === "true" && (
                        <Panel
                            header={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <IconActivity style={{ color: '#13c2c2' }} />
                                    <span style={{ fontWeight: 600 }}>📈 调用详情</span>
                                </div>
                            }
                            itemKey="2"
                            extra={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Tag 
                                        shape='circle' 
                                        color='cyan' 
                                        style={{ 
                                            background: themeStyles.exchangeRateBg,
                                            border: `1px solid ${themeStyles.exchangeRateBorder}`,
                                            color: isDark ? '#5cdbd3' : '#13c2c2'
                                        }}
                                    >
                                        💱 汇率：$1 = 500000 tokens
                                    </Tag>
                                    <Button 
                                        icon={<IconDownload />} 
                                        theme='light' 
                                        type='primary' 
                                        onClick={(e) => exportCSV(e)} 
                                        disabled={!activeTabData.tokenValid || activeTabData.logs.length === 0}
                                        style={{ borderRadius: '6px' }}
                                    >
                                        📥 导出CSV
                                    </Button>
                                </div>
                            }
                        >
                            <Spin spinning={loading}>
                                <Table
                                    columns={columns}
                                    dataSource={activeTabData.logs}
                                    pagination={{
                                        pageSize: pageSize,
                                        hideOnSinglePage: true,
                                        showSizeChanger: true,
                                        pageSizeOpts: [10, 20, 50, 100],
                                        onPageSizeChange: (pageSize) => setPageSize(pageSize),
                                        showTotal: (total) => `📊 共 ${total} 条记录`,
                                        showQuickJumper: true,
                                        total: activeTabData.logs.length,
                                        style: { marginTop: 12 },
                                    }}
                                    style={{ 
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}
                                />
                            </Spin>
                        </Panel>
                    )}
                </Collapse>
            </Card>
        </>
    );

    // 初始化加载状态
    if (isInitializing) {
        const themeStyles = getThemeStyles();
        return (
            <Card style={{ 
                marginTop: 24,
                background: isDark 
                    ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
                    : 'linear-gradient(135deg, #f0f9ff 0%, #f6ffed 100%)',
                border: `1px solid ${isDark ? '#30363d' : '#91d5ff'}`,
                borderRadius: '12px',
                boxShadow: themeStyles.cardShadow
            }}>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ marginBottom: 24 }}>
                        <span style={{ fontSize: '48px' }}>🚀</span>
                    </div>
                    <Spin size="large" style={{ marginBottom: 16 }} />
                    <div style={{ marginTop: 16 }}>
                        <Text style={{ 
                            fontSize: '16px', 
                            color: isDark ? '#69c0ff' : '#1890ff', 
                            fontWeight: 500 
                        }}>
                            正在初始化 NewAPI 密钥检测工具...
                        </Text>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                            请稍候，正在为您准备最佳的检测体验
                        </Text>
                    </div>
                </div>
            </Card>
        );
    }

    // 错误边界渲染
    if (hasError) {
        return (
            <Card style={{ marginTop: 24 }}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Text type="danger" style={{ fontSize: '18px', marginBottom: '16px', display: 'block' }}>
                        应用程序遇到错误
                    </Text>
                    <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                        {errorMessage}
                    </Text>
                    <Button 
                        type="primary"
                        onClick={() => {
                            setHasError(false);
                            setErrorMessage('');
                            setIsInitializing(true);
                            window.location.reload();
                        }}
                    >
                        重新加载页面
                    </Button>
                </div>
            </Card>
        );
    }

    try {
        return (
            <>
                {Object.keys(baseUrls).length > 1 ? (
                    <Tabs type="line" onChange={handleTabChange} activeKey={activeTabKey}>
                        {Object.entries(baseUrls).map(([key, url]) => {
                            const isCustom = key.startsWith('Custom_');
                            let displayName;
                            if (isCustom) {
                                try {
                                    displayName = `🔧 ${new URL(url).hostname}`;
                                } catch (e) {
                                    displayName = `🔧 自定义`;
                                }
                            } else {
                                displayName = `🌐 ${key}`;
                            }
                            const tabTitle = (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 6,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: key === activeTabKey ? themeStyles.tabActiveBg : 'transparent'
                                }}>
                                    <span style={{ 
                                        fontSize: '13px',
                                        fontWeight: key === activeTabKey ? 600 : 400,
                                        color: key === activeTabKey ? (isDark ? '#69c0ff' : '#1890ff') : undefined
                                    }}>
                                        {displayName}
                                    </span>
                                    {isCustom && (
                                        <Button 
                                            type="danger" 
                                            theme="borderless" 
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeCustomUrl(key);
                                            }}
                                            style={{ 
                                                fontSize: '12px', 
                                                padding: '2px 4px',
                                                minWidth: '16px',
                                                height: '16px',
                                                borderRadius: '50%'
                                            }}
                                        >
                                            ❌
                                        </Button>
                                    )}
                                </div>
                            );
                            
                            return (
                                <TabPane tab={tabTitle} itemKey={key} key={key}>
                                    {renderContent()}
                                </TabPane>
                            );
                        })}
                    </Tabs>
                ) : (
                    renderContent()
                )}
            </>
        );
    } catch (error) {
        console.error('Render error:', error);
        return (
            <Card style={{ marginTop: 24 }}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Text type="danger">渲染时发生错误：{error.message}</Text>
                </div>
            </Card>
        );
    }
};

export default LogsTable;
