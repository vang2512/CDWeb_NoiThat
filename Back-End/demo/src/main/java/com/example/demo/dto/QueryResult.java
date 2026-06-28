package com.example.demo.dto;

public class QueryResult {
    private String sql;
    private String replyIntro;

    public QueryResult() {}

    public QueryResult(String sql, String replyIntro) {
        this.sql = sql;
        this.replyIntro = replyIntro;
    }

    public String getSql() {
        return sql;
    }

    public void setSql(String sql) {
        this.sql = sql;
    }

    public String getReplyIntro() {
        return replyIntro;
    }

    public void setReplyIntro(String replyIntro) {
        this.replyIntro = replyIntro;
    }
}