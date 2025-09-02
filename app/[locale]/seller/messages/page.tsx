'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  MessageSquare,
  Send,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Phone,
  Video,
  Paperclip,
  MoreVertical,
  Archive,
  Flag,
  Trash2,
  Reply,
  Forward,
  User,
  Bot,
  Zap,
  TrendingUp,
  MessageCircle,
  Headphones,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  Plus,
  Image as ImageIcon,
  Smile,
  Mic
} from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderType: 'customer' | 'seller' | 'system';
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  subject: string;
  status: 'active' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  assignedTo?: string;
  orderId?: string;
}

interface CustomerServiceStats {
  totalConversations: number;
  activeConversations: number;
  pendingConversations: number;
  resolvedToday: number;
  averageResponseTime: number; // in minutes
  customerSatisfactionScore: number;
  totalMessages: number;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const statusColors = {
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export default function MessagesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [stats] = useState<CustomerServiceStats>({
    totalConversations: 156,
    activeConversations: 23,
    pendingConversations: 8,
    resolvedToday: 15,
    averageResponseTime: 12, // 12 minutes
    customerSatisfactionScore: 4.7,
    totalMessages: 2341,
  });
  
  // Mock data with Saudi context
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        customerId: 'c1',
        customerName: 'أحمد محمد العتيبي',
        customerPhone: '+966501234567',
        subject: 'استفسار عن محرك تويوتا كامري 2015',
        status: 'active',
        priority: 'high',
        unreadCount: 2,
        createdAt: '2024-12-16T10:30:00Z',
        updatedAt: '2024-12-16T11:15:00Z',
        tags: ['محرك', 'كامري', 'طلب سريع'],
        orderId: 'ORD-789',
        lastMessage: {
          id: 'm1',
          conversationId: '1',
          senderId: 'c1',
          senderName: 'أحمد محمد العتيبي',
          senderType: 'customer',
          content: 'هل المحرك ما زال متوفراً؟ أحتاجه بشكل عاجل',
          type: 'text',
          timestamp: '2024-12-16T11:15:00Z',
          status: 'delivered',
        },
      },
      {
        id: '2',
        customerId: 'c2',
        customerName: 'فاطمة عبدالله السلمي',
        customerPhone: '+966502345678',
        subject: 'شكوى بخصوص جودة القطعة',
        status: 'pending',
        priority: 'urgent',
        unreadCount: 1,
        createdAt: '2024-12-16T09:20:00Z',
        updatedAt: '2024-12-16T10:45:00Z',
        tags: ['شكوى', 'جودة', 'استرداد'],
        orderId: 'ORD-456',
        lastMessage: {
          id: 'm2',
          conversationId: '2',
          senderId: 'c2',
          senderName: 'فاطمة عبدالله السلمي',
          senderType: 'customer',
          content: 'القطعة لا تعمل بشكل صحيح، أريد استرداد المبلغ',
          type: 'text',
          timestamp: '2024-12-16T10:45:00Z',
          status: 'delivered',
        },
      },
      {
        id: '3',
        customerId: 'c3',
        customerName: 'عمر حسن الشمري',
        customerPhone: '+966503456789',
        subject: 'استفسار عن التوصيل للدمام',
        status: 'resolved',
        priority: 'medium',
        unreadCount: 0,
        createdAt: '2024-12-15T14:30:00Z',
        updatedAt: '2024-12-16T09:00:00Z',
        tags: ['توصيل', 'دمام', 'شحن'],
        lastMessage: {
          id: 'm3',
          conversationId: '3',
          senderId: 'seller',
          senderName: 'متجر قطع الغيار',
          senderType: 'seller',
          content: 'تم حل المشكلة. شكراً لك',
          type: 'text',
          timestamp: '2024-12-16T09:00:00Z',
          status: 'read',
        },
      },
    ];
    
    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0]);
    setLoading(false);
  }, []);
  
  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages: Message[] = [
        {
          id: 'm1-1',
          conversationId: selectedConversation.id,
          senderId: selectedConversation.customerId,
          senderName: selectedConversation.customerName,
          senderType: 'customer',
          content: 'السلام عليكم، أحتاج محرك تويوتا كامري 2015. هل متوفر؟',
          type: 'text',
          timestamp: '2024-12-16T10:30:00Z',
          status: 'read',
        },
        {
          id: 'm1-2',
          conversationId: selectedConversation.id,
          senderId: 'seller',
          senderName: 'متجر قطع الغيار المميز',
          senderType: 'seller',
          content: 'وعليكم السلام ورحمة الله وبركاته. نعم المحرك متوفر. السعر 8500 ريال مع الضمان',
          type: 'text',
          timestamp: '2024-12-16T10:35:00Z',
          status: 'read',
        },
        {
          id: 'm1-3',
          conversationId: selectedConversation.id,
          senderId: selectedConversation.customerId,
          senderName: selectedConversation.customerName,
          senderType: 'customer',
          content: 'ممتاز. كم فترة الضمان؟ ومتى يمكن التسليم؟',
          type: 'text',
          timestamp: '2024-12-16T11:00:00Z',
          status: 'read',
        },
        {
          id: 'm1-4',
          conversationId: selectedConversation.id,
          senderId: selectedConversation.customerId,
          senderName: selectedConversation.customerName,
          senderType: 'customer',
          content: 'هل المحرك ما زال متوفراً؟ أحتاجه بشكل عاجل',
          type: 'text',
          timestamp: '2024-12-16T11:15:00Z',
          status: 'delivered',
        },
      ];
      
      setMessages(mockMessages);
    }
  }, [selectedConversation]);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = searchQuery === '' ||
      conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || conversation.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || conversation.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    
    setSending(true);
    
    const message: Message = {
      id: `m-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: 'seller',
      senderName: 'متجر قطع الغيار المميز',
      senderType: 'seller',
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate message sending
    setTimeout(() => {
      setSending(false);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    const labels = {
      low: { ar: 'منخفضة', en: 'Low' },
      medium: { ar: 'متوسطة', en: 'Medium' },
      high: { ar: 'عالية', en: 'High' },
      urgent: { ar: 'عاجلة', en: 'Urgent' },
    };
    
    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors]} variant="outline">
        {labels[priority as keyof typeof labels]?.[locale as 'ar' | 'en'] || priority}
      </Badge>
    );
  };
  
  const getStatusBadge = (status: string) => {
    const labels = {
      active: { ar: 'نشط', en: 'Active' },
      pending: { ar: 'معلق', en: 'Pending' },
      resolved: { ar: 'محلول', en: 'Resolved' },
      closed: { ar: 'مغلق', en: 'Closed' },
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors]} variant="outline">
        {labels[status as keyof typeof labels]?.[locale as 'ar' | 'en'] || status}
      </Badge>
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold card-title-enhanced mb-2">
            {isArabic ? 'الرسائل وخدمة العملاء' : 'Messages & Customer Service'}
          </h1>
          <p className="text-muted-foreground text-label">
            {isArabic 
              ? `${stats.activeConversations} محادثة نشطة • متوسط الرد ${stats.averageResponseTime} دقيقة`
              : `${stats.activeConversations} active conversations • ${stats.averageResponseTime}min avg response`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="me-2 h-4 w-4" />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Settings className="me-2 h-4 w-4" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="messages-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'المحادثات النشطة' : 'Active Conversations'}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-blue-600">{stats.activeConversations}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'تحتاج رد' : 'Need response'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="messages-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'معدل الرد' : 'Response Time'}
              </CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-green-600">{stats.averageResponseTime}{isArabic ? 'د' : 'm'}</div>
            <div className="flex items-center gap-1 text-detail mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">-2{isArabic ? 'د' : 'm'}</span>
              <span className="text-detail text-muted-foreground">
                {isArabic ? 'تحسن' : 'improved'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="messages-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'محلولة اليوم' : 'Resolved Today'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-green-600">{stats.resolvedToday}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'مشكلة حُلت' : 'issues resolved'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="messages-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'رضا العملاء' : 'Satisfaction'}
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-yellow-600">{stats.customerSatisfactionScore}/5</div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-3 w-3 ${
                    star <= stats.customerSatisfactionScore 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {isArabic ? 'المحادثات' : 'Conversations'}
              </CardTitle>
              <Badge variant="secondary">
                {filteredConversations.length}
              </Badge>
            </div>
            
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={isArabic ? 'البحث في المحادثات...' : 'Search conversations...'}
                  className="ps-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                    <SelectItem value="active">{isArabic ? 'نشط' : 'Active'}</SelectItem>
                    <SelectItem value="pending">{isArabic ? 'معلق' : 'Pending'}</SelectItem>
                    <SelectItem value="resolved">{isArabic ? 'محلول' : 'Resolved'}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={isArabic ? 'الأولوية' : 'Priority'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                    <SelectItem value="urgent">{isArabic ? 'عاجل' : 'Urgent'}</SelectItem>
                    <SelectItem value="high">{isArabic ? 'عالي' : 'High'}</SelectItem>
                    <SelectItem value="medium">{isArabic ? 'متوسط' : 'Medium'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedConversation?.id === conversation.id ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.customerAvatar} />
                        <AvatarFallback>
                          {conversation.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-500 text-white text-xs"
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold truncate">
                          {conversation.customerName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.updatedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {conversation.subject}
                      </p>
                      <p className="text-sm mb-2 line-clamp-2">
                        {conversation.lastMessage.content}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(conversation.status)}
                        {getPriorityBadge(conversation.priority)}
                      </div>
                      {conversation.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {conversation.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.customerAvatar} />
                      <AvatarFallback>
                        {selectedConversation.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedConversation.customerName}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{selectedConversation.subject}</p>
                        {selectedConversation.orderId && (
                          <Badge variant="outline" className="text-xs">
                            {selectedConversation.orderId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isArabic ? 'اتصال صوتي' : 'Voice Call'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          {isArabic ? 'معلومات العميل' : 'Customer Info'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="mr-2 h-4 w-4" />
                          {isArabic ? 'وضع علامة' : 'Flag Conversation'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="mr-2 h-4 w-4" />
                          {isArabic ? 'أرشفة' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isArabic ? 'حذف المحادثة' : 'Delete Conversation'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.senderType === 'seller' 
                            ? 'justify-end' 
                            : 'justify-start'
                        }`}
                      >
                        {message.senderType === 'customer' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderType === 'seller'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.senderType === 'seller' && (
                              <div className="text-xs opacity-70">
                                {message.status === 'sent' && '✓'}
                                {message.status === 'delivered' && '✓✓'}
                                {message.status === 'read' && '✓✓'}
                              </div>
                            )}
                          </div>
                        </div>
                        {message.senderType === 'seller' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {isArabic ? 'أن' : 'ME'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {sending && (
                      <div className="flex justify-end">
                        <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                          {isArabic ? 'جاري الإرسال...' : 'Sending...'}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Type your message...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isArabic ? 'إرفاق ملف' : 'Attach File'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim() || sending}
                      className="px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  {isArabic ? 'اختر محادثة' : 'Select a Conversation'}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic 
                    ? 'اختر محادثة من القائمة لبدء التواصل مع العملاء'
                    : 'Choose a conversation from the list to start communicating with customers'}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}