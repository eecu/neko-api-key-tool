import React, { useState, useEffect } from 'react';
import { Button, Input, Typography, Table, Tag, Spin, Card, Collapse, Toast, Space, Tabs } from '@douyinfe/semi-ui';
import { IconSearch, IconCopy, IconDownload, IconSetting } from '@douyinfe/semi-icons';
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
        // 提供一个安全的默认值
        const defaultUrls = { 'NewAPI示例': 'https://your-newapi-domain.com' };
        
        try {
            const envUrl = process.env.REACT_APP_BASE_URL;
            if (!envUrl || !envUrl.trim()) {
                return defaultUrls;
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
            
            return defaultUrls;
        } catch (error) {
            // 任何错误都返回默认值
            return defaultUrls;
        }
    };
    
    const [baseUrls, setBaseUrls] = useState(() => getInitialBaseUrls());

    useEffect(() => {
        try {
            // 默认设置第一个地址为baseUrl
            const keys = Object.keys(baseUrls);
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
        setActiveTabKey(newKey);
        setBaseUrl(testUrl);
        setCustomBaseUrl('');
        setShowCustomInput(false);
        Toast.success('自定义BASE_URL添加成功！');
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

    const renderContent = () => (
        <>
            <Card style={{ marginTop: 24 }}>
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Text strong>当前API地址：</Text>
                        <Tag color="blue">{baseUrl}</Tag>
                        <Button 
                            icon={<IconSetting />} 
                            theme="borderless" 
                            onClick={() => setShowCustomInput(!showCustomInput)}
                        >
                            自定义
                        </Button>
                    </div>
                    
                    {showCustomInput && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            <Input
                                placeholder="输入自定义BASE_URL，例如：https://api.example.com"
                                value={customBaseUrl}
                                onChange={setCustomBaseUrl}
                                style={{ flex: 1 }}
                            />
                            <Button type="primary" onClick={addCustomBaseUrl}>
                                添加
                            </Button>
                            <Button onClick={() => {
                                setShowCustomInput(false);
                                setCustomBaseUrl('');
                            }}>
                                取消
                            </Button>
                        </div>
                    )}
                    
                    <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                        <Text type="secondary">
                            💡 提示: 支持多种令牌格式 (sk-xxx, sess-xxx, 或其他NewAPI令牌格式)
                        </Text>
                    </div>
                </div>
                
                <Input
                    showClear
                    value={apikey}
                    onChange={(value) => setAPIKey(value)}
                    placeholder="请输入API令牌 (支持sk-xxx、sess-xxx等格式)"
                    prefix={<IconSearch />}
                    suffix={
                        <Button
                            type='primary'
                            theme="solid"
                            onClick={fetchData}
                            loading={loading}
                            disabled={apikey === ''}
                        >
                            查询
                        </Button>
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            fetchData();
                        }
                    }}
                />
            </Card>
            <Card style={{ marginTop: 24 }}>
                <Collapse activeKey={activeKeys} onChange={(keys) => setActiveKeys(keys)}>
                    {process.env.REACT_APP_SHOW_BALANCE === "true" && (
                        <Panel
                            header="令牌信息"
                            itemKey="1"
                            extra={
                                <Button icon={<IconCopy />} theme='borderless' type='primary' onClick={(e) => copyTokenInfo(e)} disabled={!activeTabData.tokenValid}>
                                    复制令牌信息
                                </Button>
                            }
                        >
                            <Spin spinning={loading}>
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary">
                                        令牌总额：{activeTabData.balance === 100000000 ? "无限" : activeTabData.balance === "未知" || activeTabData.balance === undefined ? "未知" : `${activeTabData.balance.toFixed(3)}`}
                                    </Text>
                                    <br /><br />
                                    <Text type="secondary">
                                        剩余额度：{activeTabData.balance === 100000000 ? "无限制" : activeTabData.balance === "未知" || activeTabData.usage === "未知" || activeTabData.balance === undefined || activeTabData.usage === undefined ? "未知" : `${(activeTabData.balance - activeTabData.usage).toFixed(3)}`}
                                    </Text>
                                    <br /><br />
                                    <Text type="secondary">
                                        已用额度：{activeTabData.balance === 100000000 ? "不进行计算" : activeTabData.usage === "未知" || activeTabData.usage === undefined ? "未知" : `${activeTabData.usage.toFixed(3)}`}
                                    </Text>
                                    <br /><br />
                                    <Text type="secondary">
                                        有效期至：{activeTabData.accessdate === 0 ? '永不过期' : activeTabData.accessdate === "未知" ? '未知' : renderTimestamp(activeTabData.accessdate)}
                                    </Text>
                                </div>
                            </Spin>
                        </Panel>
                    )}
                    {process.env.REACT_APP_SHOW_DETAIL === "true" && (
                        <Panel
                            header="调用详情"
                            itemKey="2"
                            extra={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Tag shape='circle' color='green' style={{ marginRight: 5 }}>计算汇率：$1 = 50 0000 tokens</Tag>
                                    <Button icon={<IconDownload />} theme='borderless' type='primary' onClick={(e) => exportCSV(e)} disabled={!activeTabData.tokenValid || activeTabData.logs.length === 0}>
                                        导出为CSV文件
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
                                        showTotal: (total) => `共 ${total} 条`,
                                        showQuickJumper: true,
                                        total: activeTabData.logs.length,
                                        style: { marginTop: 12 },
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
        return (
            <Card style={{ marginTop: 24 }}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text type="secondary">正在初始化应用...</Text>
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
                            const tabTitle = (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span>{isCustom ? '自定义' : key}</span>
                                    {isCustom && (
                                        <Button 
                                            type="danger" 
                                            theme="borderless" 
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeCustomUrl(key);
                                            }}
                                            style={{ fontSize: '12px', padding: '2px 4px' }}
                                        >
                                            ×
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
