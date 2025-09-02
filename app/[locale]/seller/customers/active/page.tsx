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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Activity,
  Search,
  Star,
  MoreHorizontal,
  MessageSquare,
  Gift,
  TrendingUp,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ActiveCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar?: string;
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  orderFrequency: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly';
  rating: number;
  loyaltyScore: number;
  preferredCategories: string[];
  daysSinceLastOrder: number;
  status: 'Active' | 'At Risk' | 'Regular';
  nextOrderPredicted: string;
}

const mockActiveCustomers: ActiveCustomer[] = [
  {
    id: '1',
    name: 'عبد الله محمد العتيبي',
    email: 'abdullah.alotaibi@email.com',
    phone: '+966 50 123 4567',
    city: 'الرياض',
    lastOrderDate: '2024-01-25T10:30:00Z',
    totalOrders: 18,
    totalSpent: 42000,
    averageOrderValue: 2333,
    orderFrequency: 'Monthly',
    rating: 4.8,
    loyaltyScore: 85,
    preferredCategories: ['Engine Parts', 'Filters'],
    daysSinceLastOrder: 8,
    status: 'Active',
    nextOrderPredicted: '2024-02-20T00:00:00Z',
  },
  {
    id: '2',
    name: 'فاطمة أحمد القرشي',
    email: 'fatima.alqurashi@email.com',
    phone: '+966 55 987 6543',
    city: 'مكة المكرمة',
    lastOrderDate: '2024-01-15T14:15:00Z',
    totalOrders: 12,
    totalSpent: 28000,
    averageOrderValue: 2333,
    orderFrequency: 'Bi-weekly',
    rating: 4.9,
    loyaltyScore: 78,
    preferredCategories: ['Body Parts', 'Interior'],
    daysSinceLastOrder: 18,
    status: 'At Risk',
    nextOrderPredicted: '2024-02-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'سالم خالد الدوسري',
    email: 'salem.aldosari@email.com',
    phone: '+966 56 234 5678',
    city: 'الدمام',
    lastOrderDate: '2024-01-28T16:45:00Z',
    totalOrders: 24,
    totalSpent: 56000,
    averageOrderValue: 2333,
    orderFrequency: 'Weekly',
    rating: 4.7,
    loyaltyScore: 92,
    preferredCategories: ['Suspension', 'Brakes', 'Electrical'],
    daysSinceLastOrder: 5,
    status: 'Active',
    nextOrderPredicted: '2024-02-05T00:00:00Z',
  },
  {
    id: '4',
    name: 'نورا علي الحربي',
    email: 'nora.alharbi@email.com',
    phone: '+966 50 876 5432',
    city: 'جدة',
    lastOrderDate: '2024-01-20T11:30:00Z',
    totalOrders: 8,
    totalSpent: 18000,
    averageOrderValue: 2250,
    orderFrequency: 'Quarterly',
    rating: 4.6,
    loyaltyScore: 65,
    preferredCategories: ['Lights', 'Accessories'],
    daysSinceLastOrder: 13,
    status: 'Regular',
    nextOrderPredicted: '2024-03-15T00:00:00Z',
  },
  {
    id: '5',
    name: 'محمد سعود الشمري',
    email: 'mohammed.alshamri@email.com',
    phone: '+966 54 345 6789',
    city: 'الرياض',
    lastOrderDate: '2024-01-30T09:15:00Z',
    totalOrders: 31,
    totalSpent: 78000,
    averageOrderValue: 2516,
    orderFrequency: 'Bi-weekly',
    rating: 4.9,
    loyaltyScore: 96,
    preferredCategories: ['Engine Parts', 'Transmission'],
    daysSinceLastOrder: 3,
    status: 'Active',
    nextOrderPredicted: '2024-02-10T00:00:00Z',
  },
];

const statusColors = {
  Active: 'bg-green-100 text-green-800 border-green-300',
  'At Risk': 'bg-red-100 text-red-800 border-red-300',
  Regular: 'bg-blue-100 text-blue-800 border-blue-300',
};

const frequencyColors = {
  Weekly: 'bg-green-100 text-green-800',
  'Bi-weekly': 'bg-blue-100 text-blue-800',
  Monthly: 'bg-yellow-100 text-yellow-800',
  Quarterly: 'bg-purple-100 text-purple-800',
};

export default function ActiveCustomersPage() {
  const [customers, setCustomers] = useState<ActiveCustomer[]>(mockActiveCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastOrderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isRetentionDialogOpen, setIsRetentionDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ActiveCustomer | null>(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    const matchesFrequency = selectedFrequency === 'all' || customer.orderFrequency === selectedFrequency;
    
    return matchesSearch && matchesStatus && matchesFrequency;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: any = a[sortBy as keyof ActiveCustomer];
    let bValue: any = b[sortBy as keyof ActiveCustomer];
    
    if (sortBy === 'lastOrderDate' || sortBy === 'nextOrderPredicted') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalActiveCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const atRiskCustomers = customers.filter(c => c.status === 'At Risk').length;
  const totalActiveRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const averageLoyaltyScore = customers.reduce((sum, c) => sum + c.loyaltyScore, 0) / customers.length;

  const handleSendRetention = () => {
    setIsRetentionDialogOpen(false);
    toast({
      title: 'Retention Campaign Sent',
      description: `Personalized retention campaign sent to ${selectedCustomer?.name}`,
      variant: 'success',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const getLoyaltyColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-8 w-8 text-[#1B6D2F]" />
            Active Customers
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and engage your most valuable active customers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active</CardTitle>
            <Activity className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveCustomers}</div>
            <p className="text-xs text-gray-600">{activeCustomers} highly active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{atRiskCustomers}</div>
            <p className="text-xs text-gray-600">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B6D2F]">SAR {totalActiveRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Total active spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Loyalty Score</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageLoyaltyScore)}</div>
            <p className="text-xs text-gray-600">Out of 100</p>
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
                  placeholder="Search active customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Customer Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Order Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastOrderDate">Last Order</SelectItem>
                <SelectItem value="totalSpent">Total Spent</SelectItem>
                <SelectItem value="loyaltyScore">Loyalty Score</SelectItem>
                <SelectItem value="totalOrders">Total Orders</SelectItem>
                <SelectItem value="nextOrderPredicted">Next Order</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Active Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Purchase History</TableHead>
                <TableHead>Activity Status</TableHead>
                <TableHead>Loyalty</TableHead>
                <TableHead>Next Order</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-500">{customer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        {customer.city}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-[#1B6D2F]">
                        SAR {customer.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.totalOrders} orders
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: SAR {customer.averageOrderValue.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={`${statusColors[customer.status]} border`}>
                        {customer.status}
                      </Badge>
                      <div>
                        <Badge className={`${frequencyColors[customer.orderFrequency]} text-xs`}>
                          {customer.orderFrequency}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {customer.daysSinceLastOrder} days ago
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className={`font-medium ${getLoyaltyColor(customer.loyaltyScore)}`}>
                        {customer.loyaltyScore}/100
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.preferredCategories.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{formatDate(customer.nextOrderPredicted)}</div>
                      <div className="text-gray-500">
                        Predicted
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
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsRetentionDialogOpen(true);
                          }}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Send Retention Offer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedCustomers.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active customers found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retention Campaign Dialog */}
      <Dialog open={isRetentionDialogOpen} onOpenChange={setIsRetentionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#1B6D2F]" />
              Send Retention Campaign
            </DialogTitle>
            <DialogDescription>
              Send a personalized retention campaign to {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Retention Strategies Available:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Personalized part recommendations</li>
                <li>• Loyalty discount based on history</li>
                <li>• Priority customer service</li>
                <li>• Early access to new parts</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRetentionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRetention} className="bg-[#1B6D2F] hover:bg-[#145A26]">
              Send Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}