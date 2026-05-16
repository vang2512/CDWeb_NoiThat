import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    ReloadOutlined,
    LoginOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined
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
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [type, setType] = useState("");
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchLogs = async (pageValue: number, typeValue: string) => {
        setLoading(true);
        try {
            const res = await adminApi.getLogs({
                page: pageValue,
                size: 15,
                type: typeValue || null,
                sort: "createdAt,desc"
            });

            const data = res.data;
            setLogs(data.content || []);
            setTotalPages(data.totalPages || 0);

        } catch (err) {
            console.error("Fetch logs error:", err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="log-page">
            <div className="log-header">
                <div className="log-actions">
                    <select
                        value={type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="log-select"
                    >
                        <option value="">Tất cả</option>
                        <option value="AUTH">AUTH</option>
                        <option value="ACTIVITY">ACTIVITY</option>
                    </select>

                    <button
                        className={`auto-refresh-btn ${autoRefresh ? "active" : ""}`}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        title="Tự động refresh mỗi 10s"
                    >
                        <SyncOutlined spin={autoRefresh} /> Auto
                    </button>

                    <button onClick={fetchLogs} className="reload-btn">
                        <ReloadOutlined /> Refresh
                    </button>
                </div>
            </div>

            <div className="log-table-container">
                {loading ? (
                    <div className="skeleton-container">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="skeleton-row">
                                <div className="skeleton-cell"></div>
                                <div className="skeleton-cell"></div>
                                <div className="skeleton-cell"></div>
                                <div className="skeleton-cell"></div>
                                <div className="skeleton-cell"></div>
                                <div className="skeleton-cell"></div>
                                <div className="skeleton-cell"></div>
                                <div className="skeleton-cell"></div>
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <p>Không có dữ liệu log</p>
                        <button onClick={fetchLogs} className="empty-btn">
                            <ReloadOutlined /> Thử lại
                        </button>
                    </div>
                ) : (
                    <div className="table-wrapper">
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
                                {logs.map((log) => (
                                    <tr key={log.id} className="log-row">
                                        <td className="log-id">#{log.id}</td>
                                        <td>
                                            <span className={`badge badge-${log.type.toLowerCase()}`}>
                                                {getTypeIcon(log.type)} {log.type}
                                            </span>
                                        </td>
                                        <td className="log-username">{log.username || "SYSTEM"}</td>
                                        <td className="log-action">{log.action}</td>
                                        <td className="log-module">{log.module || "-"}</td>
                                        <td className="log-message" title={log.message}>
                                            {log.message.length > 50
                                                ? log.message.slice(0, 50) + "..."
                                                : log.message}
                                        </td>
                                        <td className="log-ip">{log.ipAddress}</td>
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
                    </div>
                )}
            </div>

            {!loading && logs.length > 0 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page === 0}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        ← Trước
                    </button>

                    <div className="page-info">
                        <span className="page-current">{page + 1}</span>
                        <span className="page-total"> / {totalPages}</span>
                    </div>

                    <button
                        className="page-btn"
                        disabled={page + 1 >= totalPages}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
};

export default LogAdmin;