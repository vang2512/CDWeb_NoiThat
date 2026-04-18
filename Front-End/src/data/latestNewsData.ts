export interface LatestNewsItem {
    id: number;
    title: string;
    description: string;
    image: string;
    time: string;
}

export const latestNewsData: LatestNewsItem[] = [
    {
        id: 1,
        title: "Toyota lược bớt khuyến mại hàng loạt xe, Vios giảm giá ít hơn tháng trước",
        description:
            "(Dân trí) - Trong tháng đầu tiên của năm mới, Toyota Việt Nam chỉ áp dụng chương " +
            "trình khuyến mại cho 4 mẫu xe, ít hơn gần một nửa so với tháng 12/2025.",
        image:
            "https://cdnphoto.dantri.com.vn/vfiSoDnLAP9DoGWM0ci5KDSHgt4=/zoom/432_288/2026/01/03/toyota-viet-nam-cat-giam-khuyen-mai-trong-thang-1-2026-anh1jpg-1767415701578.jpg",
        time: "21 phút trước",
    },
    {
        id: 2,
        title: "Không đưa vợ về ngoại dịp Tết Dương, tôi bị cả nhà vợ soi như kẻ bạc tình",
        description:
            "(Dân trí) - Tôi không nghĩ chỉ vì một kỳ nghỉ Tết Dương lịch mà vợ chồng tôi lại căng thẳng đến mức này. Càng không ngờ rằng, " +
            "trong mắt vợ và cả nhà ngoại, tôi bỗng nhiên trở thành một kẻ chồng vô tâm, tệ bạc.",
        image:
            "https://cdnphoto.dantri.com.vn/eA4Frq6QmUBFjf_JSau2qi5lu6A=/zoom/432_288/2026/01/03/bai-1-cropped-1767433132413.jpg",
        time: "36 phút trước",
    },
    {
        id: 3,
        title: "Nga kêu gọi làm rõ ngay lập tức tung tích của Tổng thống Maduro",
        description:
            "(Dân trí) - Bộ Ngoại giao Nga yêu cầu “làm rõ ngay lập tức” tuyên bố của Tổng thống Donald Trump rằng Mỹ đã bắt giữ " +
            "Tổng thống Venezuela Nicolas Maduro và vợ ông.",
        image:
            "https://cdnphoto.dantri.com.vn/HxU9YGHGluUVdodeVpKyxQpSeQ8=/zoom/432_288/2026/01/03/maduroafpjpg-1767443969625.jpg",
        time: "38 phút trước",
    },

    {
        id: 4,
        title: "AFC nêu thành tích nổi bật của U23 Việt Nam, sánh ngang Hàn Quốc",
        description:
            "(Dân trí) - Liên đoàn bóng đá châu Á (AFC) mới đây đã đưa ra những thống kê nổi bật của các đội bóng ở giải U23 châu Á 2026. " +
            "Theo đó, U23 Việt Nam là một trong ba đội không để thủng lưới bàn nào ở vòng loại.",
        image:
            "https://cdnphoto.dantri.com.vn/2PnRmPAUYOqQ44OuG9mrx8t8Uhc=/zoom/432_288/2026/01/03/u23-viet-nam-lap-ky-luc-chua-tung-co-tai-giai-u23-dong-nam-a-cropped-1767444635862.jpg",
        time: "40 phút trước",
    },

];
