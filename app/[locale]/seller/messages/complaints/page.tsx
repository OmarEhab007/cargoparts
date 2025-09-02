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
  AlertTriangle,
  Search,
  MoreHorizontal,
  MessageSquare,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  complaint: string;
  complaintType: 'product_quality' | 'service' | 'delivery' | 'billing' | 'other';
  receivedDate: string;
  status: 'new' | 'investigating' | 'resolved' | 'escalated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  orderReference?: string;
}

const mockComplaints: Complaint[] = [
  {
    id: '1',
    customerName: 'عمر الفيصل',
    customerEmail: 'omar.alfaisal@email.com',
    subject: 'قطعة معيبة',
    complaint: 'استلمت قطعة غيار معيبة ولا تعمل بشكل صحيح، أحتاج استبدال فوري.',
    complaintType: 'product_quality',
    receivedDate: '2024-02-01T09:15:00Z',
    status: 'new',
    severity: 'high',
    orderReference: 'ORD2024-158',
  },
  {
    id: '2',
    customerName: 'هند المحمود',
    customerEmail: 'hind.almahmmoud@email.com',
    subject: 'تأخير في التسليم',
    complaint: 'طلبي تأخر أكثر من أسبوع عن الموعد المحدد بدون إشعار مسبق.',
    complaintType: 'delivery',
    receivedDate: '2024-02-01T11:30:00Z',
    status: 'investigating',
    severity: 'medium',
    orderReference: 'ORD2024-145',
  },
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [searchQuery, setSearchQuery] = useState('');

  const handleResolve = (complaintId: string) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: 'resolved' as const }
        : complaint
    ));
    toast({
      title: 'Complaint Resolved',
      description: 'The complaint has been marked as resolved.',
      variant: 'success',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Customer Complaints
          </h1>
          <p className="text-gray-600 mt-1">
            Track and resolve customer complaints
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.length}</div>
            <p className="text-xs text-gray-600">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {complaints.filter(c => c.severity === 'critical').length}
            </div>
            <p className="text-xs text-gray-600">Urgent resolution</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search complaints..."
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
                <TableHead>Complaint</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(complaint.customerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{complaint.customerName}</div>
                        <div className="text-sm text-gray-500">{complaint.customerEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium mb-1">{complaint.subject}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">{complaint.complaint}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{complaint.complaintType.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getSeverityColor(complaint.severity)} border`}>
                      {complaint.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        complaint.status === 'new' ? 'bg-red-100 text-red-800' :
                        complaint.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {complaint.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {complaint.orderReference || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Respond
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResolve(complaint.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
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