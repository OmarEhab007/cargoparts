'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  Send,
  Clock,
  User,
  Package,
  AlertCircle,
  CheckCircle,
  Reply,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ActiveMessage {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  subject: string;
  lastMessage: string;
  messageType: 'inquiry' | 'order_issue' | 'product_question' | 'support';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'waiting_customer' | 'waiting_seller';
  lastReplyDate: string;
  messageCount: number;
  relatedOrderId?: string;
  relatedProductSku?: string;
  responseTime: number; // in minutes
}

const mockActiveMessages: ActiveMessage[] = [
  {
    id: '1',
    customerName: 'أحمد محمد السعود',
    customerEmail: 'ahmed.alsaud@email.com',
    subject: 'استفسار عن توافق قطعة الغيار',
    lastMessage: 'هل هذه القطعة متوافقة مع كامري 2018؟ أريد التأكد قبل الطلب.',
    messageType: 'product_question',
    priority: 'medium',
    status: 'waiting_seller',
    lastReplyDate: '2024-02-01T14:30:00Z',
    messageCount: 3,
    relatedProductSku: 'TCR-TL-001',
    responseTime: 45,
  },
  {
    id: '2',
    customerName: 'فاطمة علي الحربي',
    customerEmail: 'fatima.alharbi@email.com',
    subject: 'مشكلة في الطلب رقم ORD2024-156',
    lastMessage: 'لم أستلم القطعة المطلوبة حتى الآن، هل يمكن تتبع الشحنة؟',
    messageType: 'order_issue',
    priority: 'high',
    status: 'active',
    lastReplyDate: '2024-02-01T16:45:00Z',
    messageCount: 5,
    relatedOrderId: 'ORD2024-156',
    responseTime: 30,
  },
  {
    id: '3',
    customerName: 'محمد خالد القحطاني',
    customerEmail: 'mohammed.alqahtani@email.com',
    subject: 'طلب تخصيص وتركيب',
    lastMessage: 'أحتاج خدمة تركيب لقطع الفرامل، هل تقدمون هذه الخدمة؟',
    messageType: 'inquiry',
    priority: 'low',
    status: 'waiting_customer',
    lastReplyDate: '2024-02-01T10:15:00Z',
    messageCount: 2,
    responseTime: 120,
  },
  {
    id: '4',
    customerName: 'نورا سعود الدوسري',
    customerEmail: 'nora.aldosari@email.com',
    subject: 'عطل في المنتج بعد التركيب',
    lastMessage: 'القطعة تعطلت بعد أسبوع من التركيب، أريد استبدالها.',
    messageType: 'support',
    priority: 'urgent',
    status: 'waiting_seller',
    lastReplyDate: '2024-02-01T18:20:00Z',
    messageCount: 4,
    relatedOrderId: 'ORD2024-142',
    relatedProductSku: 'HAC-BK-003',
    responseTime: 15,
  },
  {
    id: '5',
    customerName: 'سالم عبد الله المطيري',
    customerEmail: 'salem.almutairi@email.com',
    subject: 'استعلام عن الأسعار بالجملة',
    lastMessage: 'أريد شراء كمية كبيرة من فلاتر الزيت، هل هناك خصم؟',
    messageType: 'inquiry',
    priority: 'medium',
    status: 'active',
    lastReplyDate: '2024-02-01T12:30:00Z',
    messageCount: 6,
    responseTime: 90,
  },
];

const typeColors = {
  inquiry: 'bg-blue-100 text-blue-800',
  order_issue: 'bg-red-100 text-red-800',
  product_question: 'bg-yellow-100 text-yellow-800',
  support: 'bg-purple-100 text-purple-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-300',
  medium: 'bg-blue-100 text-blue-800 border-blue-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  urgent: 'bg-red-100 text-red-800 border-red-300',
};

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-300',
  waiting_customer: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  waiting_seller: 'bg-red-100 text-red-800 border-red-300',
};

export default function ActiveMessagesPage() {
  const [messages, setMessages] = useState<ActiveMessage[]>(mockActiveMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastReplyDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ActiveMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchQuery === '' || 
      message.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || message.messageType === selectedType;
    const matchesPriority = selectedPriority === 'all' || message.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || message.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const sortedMessages = [...filteredMessages].sort((a, b) => {
    let aValue: any = a[sortBy as keyof ActiveMessage];
    let bValue: any = b[sortBy as keyof ActiveMessage];
    
    if (sortBy === 'lastReplyDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalActiveMessages = messages.length;
  const urgentMessages = messages.filter(m => m.priority === 'urgent').length;
  const waitingSeller = messages.filter(m => m.status === 'waiting_seller').length;
  const averageResponseTime = messages.reduce((sum, m) => sum + m.responseTime, 0) / messages.length;

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;

    setMessages(prev => prev.map(message => 
      message.id === selectedMessage.id 
        ? { 
            ...message, 
            status: 'waiting_customer' as const,
            lastReplyDate: new Date().toISOString(),
            messageCount: message.messageCount + 1,
            lastMessage: replyText.substring(0, 100) + (replyText.length > 100 ? '...' : '')
          }
        : message
    ));

    setIsReplyDialogOpen(false);
    setReplyText('');
    setSelectedMessage(null);
    
    toast({
      title: 'Reply Sent',
      description: 'Your reply has been sent to the customer.',
      variant: 'success',
    });
  };

  const handleMarkAsResolved = (messageId: string) => {
    setMessages(prev => prev.filter(message => message.id !== messageId));
    
    toast({
      title: 'Message Resolved',
      description: 'The conversation has been marked as resolved.',
      variant: 'success',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const getTimeSinceLastReply = (dateString: string) => {
    const now = new Date();
    const lastReply = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - lastReply.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-[#1B6D2F]" />
            Active Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Manage ongoing conversations with customers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveMessages}</div>
            <p className="text-xs text-gray-600">Ongoing discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Messages</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentMessages}</div>
            <p className="text-xs text-gray-600">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting for Reply</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{waitingSeller}</div>
            <p className="text-xs text-gray-600">Awaiting your response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageResponseTime)} min</div>
            <p className="text-xs text-gray-600">Response speed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Message Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inquiry">General Inquiry</SelectItem>
                <SelectItem value="order_issue">Order Issue</SelectItem>
                <SelectItem value="product_question">Product Question</SelectItem>
                <SelectItem value="support">Technical Support</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting_seller">Waiting for Me</SelectItem>
                <SelectItem value="waiting_customer">Waiting for Customer</SelectItem>
                <SelectItem value="active">Active Discussion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Conversation</TableHead>
                <TableHead>Type & Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Related</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={message.customerAvatar} />
                        <AvatarFallback>{getInitials(message.customerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{message.customerName}</div>
                        <div className="text-sm text-gray-500">{message.customerEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">{message.subject}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{message.lastMessage}</div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {message.messageCount} messages
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={`${typeColors[message.messageType]} text-xs`}>
                        {message.messageType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div>
                        <Badge className={`${priorityColors[message.priority]} border text-xs`}>
                          {message.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[message.status]} border`}>
                      {message.status === 'waiting_seller' && 'Awaiting Reply'}
                      {message.status === 'waiting_customer' && 'Customer Turn'}
                      {message.status === 'active' && 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {message.relatedOrderId && (
                        <div className="flex items-center text-sm">
                          <Package className="h-3 w-3 mr-1 text-gray-400" />
                          {message.relatedOrderId}
                        </div>
                      )}
                      {message.relatedProductSku && (
                        <div className="text-sm text-gray-500">
                          SKU: {message.relatedProductSku}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{formatDate(message.lastReplyDate)}</div>
                      <div className="text-gray-500">
                        {getTimeSinceLastReply(message.lastReplyDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMessage(message);
                            setIsReplyDialogOpen(true);
                          }}
                        >
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMarkAsResolved(message.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedMessages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active messages found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="h-5 w-5 text-[#1B6D2F]" />
              Reply to {selectedMessage?.customerName}
            </DialogTitle>
            <DialogDescription>
              Subject: {selectedMessage?.subject}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              {/* Last Message */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="font-medium text-gray-900 mb-2">Last customer message:</div>
                <p className="text-sm text-gray-600">{selectedMessage.lastMessage}</p>
              </div>
              
              {/* Reply Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Reply
                </label>
                <Textarea
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              {/* Related Info */}
              {(selectedMessage.relatedOrderId || selectedMessage.relatedProductSku) && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 text-sm mb-1">Related Information:</h4>
                  <div className="text-xs text-blue-800 space-y-1">
                    {selectedMessage.relatedOrderId && (
                      <div>Order ID: {selectedMessage.relatedOrderId}</div>
                    )}
                    {selectedMessage.relatedProductSku && (
                      <div>Product SKU: {selectedMessage.relatedProductSku}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className="bg-[#1B6D2F] hover:bg-[#145A26]"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}