import { LayoutDashboard, Clock,Settings, ClipboardList, BookOpenCheck, School, GraduationCap, UserGroup,UserStar, UserPlus  } from 'lucide-react';

export const studentNavigation = [
    { name: "Dashboard", symbol: LayoutDashboard, path: "/" },
    { name: "Attendance", symbol: Clock, path: "/attendance" },
    { name: "Marks", symbol: BookOpenCheck , path: "/marks" },
    { name: "Notices", symbol: ClipboardList, path: "/notices" },
    { name: "Settings", symbol: Settings, path: "/settings" }
];

export const hodNavigation = [
    { name: "Dashboard", symbol: LayoutDashboard, path: "/" },
    { name: "Students", symbol: GraduationCap, path: "/students" },
    { name: "Student Applications", symbol: UserPlus, path: "/student-applications" },
    { name: "Faculties", symbol: UserStar, path: "/faculties" },
    { name: "Coordinators", symbol: UserGroup, path: "/assign-coordinators" },
    { name: "Subject Allocation", symbol: BookOpenCheck, path: "/subject-allocation" },
    { name: "Marks", symbol: BookOpenCheck, path: "/marks" },
    { name: "Exams", symbol: School, path: "/exams" },
    { name: "Attendance", symbol: Clock, path: "/attendance" },
    { name: "Notices", symbol: ClipboardList, path: "/notices" },
    { name: "Settings", symbol: Settings, path: "/settings" }
];

export const facultyNavigation = [
    { name: "Dashboard", symbol: LayoutDashboard, path: "/" },
    { name: "Students", symbol: GraduationCap, path: "/students" },
    { name: "Section", symbol: GraduationCap, path: "/section" },
    { name: "Exams", symbol: School, path: "/exams" },
    { name: "Marks", symbol: BookOpenCheck, path: "/marks" },
    { name: "Attendance", symbol: Clock, path: "/attendance" },
    { name: "Notices", symbol: ClipboardList, path: "/notices" },
    { name: "Settings", symbol: Settings, path: "/settings" }
];
