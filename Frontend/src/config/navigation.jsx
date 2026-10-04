import { LayoutDashboard, Clock,Settings, ClipboardList, BookOpenCheck, School, GraduationCap, UserGroup,UserStar  } from 'lucide-react';

export const studentNavigation = [
    { name: "Dashboard", symbol: LayoutDashboard, path: "/" },
    { name: "Attendance", symbol: Clock, path: "/path" },
    { name: "Marks", symbol: BookOpenCheck , path: "/path" },
    { name: "Notices", symbol: ClipboardList, path: "/path" },
    { name: "Setting", symbol: Settings, path: "/path" }
];

export const hodNavigation = [
    { name: "Dashboard", symbol: LayoutDashboard, path: "/" },
    { name: "Students", symbol: GraduationCap, path: "/path" },
    { name: "Faculties", symbol: UserStar, path: "/path" },
    { name: "Coordinators", symbol: UserGroup, path: "/path" },
    { name: "Marks", symbol: BookOpenCheck, path: "/path" },
    { name: "Exams", symbol: School, path: "/path" },
    { name: "Attendance", symbol: Clock, path: "/path" },
    { name: "Notices", symbol: ClipboardList, path: "/path" },
    { name: "Setting", symbol: Settings, path: "/path" }
];

export const facultyNavigation = [
    { name: "Dashboard", symbol: LayoutDashboard, path: "/" },
    { name: "Students", symbol: GraduationCap, path: "/path" },,
    { name: "Section", symbol: GraduationCap, path: "/path" },
    { name: "Exams", symbol: School, path: "/path" },
    { name: "Marks", symbol: BookOpenCheck, path: "/path" },
    { name: "Attendance", symbol: Clock, path: "/path" },
    { name: "Notices", symbol: ClipboardList, path: "/path" },
    { name: "Setting", symbol: Settings, path: "/path" }
];