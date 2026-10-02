import { useTheme } from "../../context/ThemeContext";
import {Moon, Sun} from 'lucide-react'

const ThemeToggle = () => {

    const { darkMode, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme}>
            {darkMode ? <Sun/> : <Moon/>}
        </button>
    );
};

export default ThemeToggle;