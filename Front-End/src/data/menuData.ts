// ===============================
// Hàm chuyển tiếng Việt → slug
// ===============================

import { fetchRSS } from "../services/rssService";
const toSlug = (str: string) =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

// ===============================
// Menu gốc
// ===============================


const rawMenuData = [
    {
        icon: "https://png.pngtree.com/png-clipart/20190619/original/pngtree-vector-house-icon-png-image_4015704.jpg",
        isHome: true,
        label: "TRANG CHỦ",
    },

    {
        label: "MỚI NHẤT",
        children: ["DNEWS", "TÂM ĐIỂM", "SỰ KIỆN"],
    },

    {
        label: "THỜI SỰ",
        children: ["THỜI SỰ", "NỘI VỤ", "PHÁP LUẬT", "BẠN ĐỌC"],
    },

    {
        label: "THẾ GIỚI",
        children: ["THẾ GIỚI"],
    },

    {
        label: "KINH TẾ",
        children: [
            "KINH DOANH",
            "BẤT ĐỘNG SẢN",
            "LAO ĐỘNG - VIỆC LÀM",
            "GIÁ VÀNG",
            "XỔ SỐ",
        ],
    },

    {
        label: "ĐỜI SỐNG",
        children: [
            "ĐỜI SỐNG",
            "SỨC KHỎE",
            "TÌNH YÊU - GIỚI TÍNH",
            "TẤM LÒNG NHÂN ÁI",
        ],
    },

    {
        label: "GIÁO DỤC",
        children: ["GIÁO DỤC", "KHOA HỌC"],
    },

    {
        label: "THỂ THAO",
        children: ["THỂ THAO"],
    },

    {
        label: "GIẢI TRÍ",
        children: ["GIẢI TRÍ", "D-BUZZ", "TỌA ĐÀM TRỰC TUYẾN"],
    },

    {
        label: "DU LỊCH",
        children: ["DU LỊCH", "Ô TÔ - XE MÁY"],
    },

    {
        label: "CÔNG NGHỆ",
        children: ["CÔNG NGHỆ", "INTERACTIVE"],
    },

    {
        label: "ĐA PHƯƠNG TIỆN",
        children: ["DMAGAZINE", "INFOGRAPHIC", "PHOTO NEWS", "PHOTO STORY"],
    },

    {
        label: "CHỦ ĐỀ",
        children: ["TẾT"],
    },
];

// ===============================
// Menu đã được gắn slug tự động
// ===============================
export const menuData = rawMenuData.map(menu => ({
    ...menu,
    // Nếu là trang chủ thì slug là chuỗi rỗng
    slug: menu.isHome ? "" : toSlug(menu.label || ""),
    children: menu.children?.map(child => ({
        label: child,
        // Con sẽ có format: cha/con (ví dụ: thoi-su/noi-vu)
        slug: `${toSlug(menu.label || "")}/${toSlug(child)}`,
    })),
}));

export default menuData;
