import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaUserAlt, FaGraduationCap, FaCertificate, FaListAlt } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Nhân viên',
    href: '/employees',
    icon: FaUserAlt,
  },
  {
    name: 'Đào tạo',
    href: '/training',
    icon: FaGraduationCap,
  },
  {
    name: 'Chứng nhận',
    href: '/certificates',
    icon: FaCertificate,
  },
  {
    name: 'Báo cáo',
    href: '/reports',
    icon: FaListAlt,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Training Management</h1>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="text-sm font-medium">Quản lý cập nhật kiến thức liên tục dựa trên web</div>
        </div>
      </div>
    </div>
  );
} 