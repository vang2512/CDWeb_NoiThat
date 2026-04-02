import { menuData } from "../../data/menuData";
import "./Navbar.css";

interface NavbarProps {
    onSelectLatest: () => void;
    onSelectHome: () => void;
    onSelectCategory: (slug: string) => void; // dùng slug
}

const Navbar = ({
                    onSelectLatest,
                    onSelectHome,
                    onSelectCategory,
                }: NavbarProps) => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                {menuData.map((item, index) => (
                    <div key={item.slug ?? index} className="menu-item-wrapper">
                        {/* MENU CHA */}
                        <button
                            type="button"
                            className="menu-link"
                            onClick={() => {
                                if (item.isHome) {
                                    onSelectHome();
                                } else if (item.label === "MỚI NHẤT") {
                                    onSelectLatest();
                                } else if (item.slug) {
                                    onSelectCategory(item.slug);
                                }
                            }}
                        >
                            {item.icon ? (
                                <img
                                    src={item.icon}
                                    alt={item.label ?? "Home"}
                                    className="menu-icon"
                                />
                            ) : (
                                item.label
                            )}
                        </button>

                        {/* SUB MENU */}
                        {item.children && (
                            <div className="submenu">
                                {item.children.map(child => (
                                    <button
                                        key={child.slug}
                                        className="submenu-item"
                                        onClick={() =>
                                            onSelectCategory(child.slug)
                                        }
                                    >
                                        {child.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
