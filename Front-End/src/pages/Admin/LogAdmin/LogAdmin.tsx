import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    ReloadOutlined,
    LoginOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    SearchOutlined,
    EyeOutlined,
    CloseOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import adminApi from "../../../api/Admin/Admin";
import "./LogAdmin.css";

dayjs.extend(relativeTime);

interface Log {
    id: number;
    type: "AUTH" | "ACTIVITY";
    action: string;
    module: string;
    username: string;
    message: string;
    ipAddress: string;
    status: "SUCCESS" | "ERROR";
    createdAt: string;
}

const LogAdmin = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchLogs = async (pageValue: number, typeValue: string) => {
        setLoading(true);
        try {
            const res = await adminApi.getLogs({
                page: pageValue,
                size: 10,
                type: typeValue || null,
                sort: "createdAt,desc"
            });

            const data = res.data;
            setLogs(data.content || []);
            setFilteredLogs(data.content || []);
            setTotalPages(data.totalPages || 0);

        } catch (err) {
            console.error("Fetch logs error:", err);
            setLogs([]);
            setFilteredLogs([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter logs by search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredLogs(logs);
        } else {
            const filtered = logs.filter(log =>
                log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLogs(filtered);
        }
    }, [searchTerm, logs]);

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchLogs(page, type);
            }, 10000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRefresh, page, type]);

    useEffect(() => {
        fetchLogs(page, type);
    }, [page, type]);

    const getTypeIcon = (t: string) => {
        if (t === "AUTH") return <LoginOutlined />;
        if (t === "ACTIVITY") return <SettingOutlined />;
        return null;
    };

    const getTypeColor = (t: string) => {
        if (t === "AUTH") return "#3b82f6";
        if (t === "ACTIVITY") return "#10b981";
        return "#6b7280";
    };

    const getStatusIcon = (status: string) => {
        return status === "SUCCESS" ? (
            <CheckCircleOutlined style={{ color: "#10b981" }} />
        ) : (
            <CloseCircleOutlined style={{ color: "#ef4444" }} />
        );
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTypeChange = (newType: string) => {
        setType(newType);
        setPage(0);
    };

    const handleViewDetail = (log: Log) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    // Statistics
    const totalLogs = logs.length;
    const authLogs = logs.filter(log => log.type === "AUTH").length;
    const activityLogs = logs.filter(log => log.type === "ACTIVITY").length;
    const errorLogs = logs.filter(log => log.status === "ERROR").length;

    return (
        <div className="log-page">

            {/* Search and Filter Bar */}
            <div className="search-bar">
                <SearchOutlined className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm kiếm log ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                        <CloseOutlined />
                    </button>
                )}
                <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Tất cả loại</option>
                    <option value="AUTH">AUTH</option>
                    <option value="ACTIVITY">ACTIVITY</option>
                </select>
            </div>


            {/* Logs Table */}
            <div className="log-table-container">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="empty-state">
                        <p>Không có dữ liệu log</p>
                        <button onClick={() => fetchLogs(page, type)} className="empty-btn">
                            <ReloadOutlined /> Thử lại
                        </button>
                    </div>
                ) : (
                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Loại</th>
                                <th>Người dùng</th>
                                <th>Hành động</th>
                                <th>Module</th>
                                <th>Message</th>
                                <th>IP</th>
                                <th>Trạng thái</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="log-id">#{log.id}</td>
                                    <td>
                                        <span 
                                            className="type-badge"
                                            style={{ 
                                                background: `${getTypeColor(log.type)}20`, 
                                                color: getTypeColor(log.type) 
                                            }}
                                        >
                                            {getTypeIcon(log.type)} {log.type}
                                        </span>
                                    </td>
                                    <td className="log-username">{log.username || "SYSTEM"}</td>
                                    <td className="log-action">{log.action}</td>
                                    <td>
                                        <span className="module-badge">
                                            {log.module || "-"}
                                        </span>
                                    </td>
                                    <td className="log-message" title={log.message}>
                                        {log.message.length > 50
                                            ? log.message.slice(0, 50) + "..."
                                            : log.message}
                                    </td>
                                    <td className="log-ip">{log.ipAddress || "-"}</td>
                                    <td>
                                        <span className={`status-badge ${log.status?.toLowerCase()}`}>
                                            {getStatusIcon(log.status)} {log.status || "N/A"}
                                        </span>
                                    </td>
                                    <td className="log-time">
                                        <div className="time-main">
                                            {log.createdAt
                                                ? dayjs(log.createdAt).format("DD/MM/YYYY")
                                                : "-"}
                                        </div>
                                        <div className="time-sub">
                                            {log.createdAt
                                                ? dayjs(log.createdAt).format("HH:mm:ss")
                                                : ""}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

{/* Pagination */}
{!loading && filteredLogs.length > 0 && totalPages > 1 && (
    <div className="pagination">
        <button
            className="page-btn nav-btn"
            disabled={page === 0}
            onClick={() => handlePageChange(page - 1)}
        >
            ←
        </button>

        <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={index}
                    className={`page-number ${page === index ? "active" : ""}`}
                    onClick={() => handlePageChange(index)}
                >
                    {index + 1}
                </button>
            ))}
        </div>

        <button
            className="page-btn nav-btn"
            disabled={page + 1 >= totalPages}
            onClick={() => handlePageChange(page + 1)}
        >
            →
        </button>
    </div>
)}

            {/* Detail Modal */}
            {isDetailModalOpen && selectedLog && (
                <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết Log #{selectedLog.id}</h2>
                            <button className="modal-close" onClick={() => setIsDetailModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <div className="detail-label">Loại:</div>
                                <div className="detail-value">
                                    <span 
                                        className="type-badge"
                                        style={{ 
                                            background: `${getTypeColor(selectedLog.type)}20`, 
                                            color: getTypeColor(selectedLog.type) 
                                        }}
                                    >
                                        {getTypeIcon(selectedLog.type)} {selectedLog.type}
                                    </span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Trạng thái:</div>
                                <div className="detail-value">
                                    <span className={`status-badge ${selectedLog.status?.toLowerCase()}`}>
                                        {getStatusIcon(selectedLog.status)} {selectedLog.status}
                                    </span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Người dùng:</div>
                                <div className="detail-value">{selectedLog.username || "SYSTEM"}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Hành động:</div>
                                <div className="detail-value">{selectedLog.action}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Module:</div>
                                <div className="detail-value">{selectedLog.module || "-"}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">IP Address:</div>
                                <div className="detail-value">{selectedLog.ipAddress || "-"}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Thời gian:</div>
                                <div className="detail-value">
                                    {selectedLog.createdAt
                                        ? dayjs(selectedLog.createdAt).format("DD/MM/YYYY HH:mm:ss")
                                        : "-"}
                                </div>
                            </div>
                            <div className="detail-row full-width">
                                <div className="detail-label">Message:</div>
                                <div className="detail-value message-content">
                                    {selectedLog.message}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsDetailModalOpen(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogAdmin;