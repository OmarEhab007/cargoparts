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
  HelpCircle,
  Search,
  MoreHorizontal,
  Reply,
  CheckCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Inquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  inquiry: string;
  inquiryType: 'product' | 'service' | 'pricing' | 'availability' | 'general';
  receivedDate: string;
  status: 'new' | 'replied' | 'resolved';
  urgency: 'low' | 'medium' | 'high';
}

const mockInquiries: Inquiry[] = [
  {
    id: '1',
    customerName: 'خالد السبيعي',
    customerEmail: 'khalid.alsubaie@email.com',
    subject: 'توفر قطع لكسزس 2020',
    inquiry: 'هل تتوفر لديكم قطع غيار أصلية لسيارة لكسزس ES350 موديل 2020؟',
    inquiryType: 'availability',
    receivedDate: '2024-02-01T10:30:00Z',
    status: 'new',
    urgency: 'medium',
  },
  {
    id: '2',
    customerName: 'منى الحارثي',
    customerEmail: 'mona.alharthi@email.com',
    subject: 'خدمة التركيب',
    inquiry: 'هل تقدمون خدمة تركيب قطع الغيار في الورشة؟',
    inquiryType: 'service',
    receivedDate: '2024-02-01T14:20:00Z',
    status: 'replied',
    urgency: 'low',
  },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [searchQuery, setSearchQuery] = useState('');

  const handleReply = (inquiryId: string) => {
    toast({
      title: 'Reply Sent',
      description: 'Your reply has been sent to the customer.',
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
            <HelpCircle className="h-8 w-8 text-blue-600" />
            Customer Inquiries
          </h1>
          <p className="text-gray-600 mt-1">
            General inquiries and questions from customers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <HelpCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
            <p className="text-xs text-gray-600">Customer questions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search inquiries..."
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
                <TableHead>Inquiry</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(inquiry.customerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{inquiry.customerName}</div>
                        <div className="text-sm text-gray-500">{inquiry.customerEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium mb-1">{inquiry.subject}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{inquiry.inquiry}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{inquiry.inquiryType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        inquiry.status === 'replied' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {inquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(inquiry.receivedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleReply(inquiry.id)}>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
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