'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Search,
  MoreHorizontal,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PendingMessage {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  receivedDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'inquiry' | 'complaint' | 'support' | 'order';
  hoursWaiting: number;
}

const mockPendingMessages: PendingMessage[] = [
  {
    id: '1',
    customerName: 'عبد الرحمن المالك',
    customerEmail: 'abdurahman.almalik@email.com',
    subject: 'طلب معلومات عن الضمان',
    message: 'أريد معرفة تفاصيل الضمان للقطع المتوفرة لديكم...',
    receivedDate: '2024-02-01T09:30:00Z',
    priority: 'medium',
    category: 'inquiry',
    hoursWaiting: 8,
  },
  {
    id: '2',
    customerName: 'لينا أحمد القاسم',
    customerEmail: 'lina.alqasim@email.com',
    subject: 'شكوى حول جودة المنتج',
    message: 'القطعة التي استلمتها لا تعمل بشكل صحيح...',
    receivedDate: '2024-02-01T07:15:00Z',
    priority: 'high',
    category: 'complaint',
    hoursWaiting: 10,
  },
];

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export default function PendingMessagesPage() {
  const [messages, setMessages] = useState<PendingMessage[]>(mockPendingMessages);
  const [searchQuery, setSearchQuery] = useState('');

  const handleApprove = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast({
      title: 'Message Approved',
      description: 'Message moved to active conversations.',
      variant: 'success',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-8 w-8 text-orange-600" />
            Pending Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Messages awaiting approval and response
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Messages</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-gray-600">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pending messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Waiting Time</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(message.customerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{message.customerName}</div>
                        <div className="text-sm text-gray-500">{message.customerEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium mb-1">{message.subject}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{message.message}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[message.priority]}>
                      {message.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{message.hoursWaiting} hours</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleApprove(message.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve & Reply
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}