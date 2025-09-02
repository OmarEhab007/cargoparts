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
  UserPlus,
  Search,
  MoreHorizontal,
  MessageSquare,
  Gift,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShoppingCart,
  Eye,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NewCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar?: string;
  signupDate: string;
  daysSinceSignup: number;
  firstOrderDate?: string;
  hasOrdered: boolean;
  profileViews: number;
  itemsViewed: number;
  cartAbandoned: boolean;
  estimatedIntent: 'High' | 'Medium' | 'Low';
  preferredCategories: string[];
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
}

const mockNewCustomers: NewCustomer[] = [
  {
    id: '1',
    name: 'سعد عبد الله المطيري',
    email: 'saad.almutairi@email.com',
    phone: '+966 50 123 4567',
    city: 'الرياض',
    signupDate: '2024-01-30T08:30:00Z',
    daysSinceSignup: 3,
    hasOrdered: false,
    profileViews: 12,
    itemsViewed: 25,
    cartAbandoned: true,
    estimatedIntent: 'High',
    preferredCategories: ['Engine Parts', 'Filters'],
    deviceType: 'Mobile',
  },
  {
    id: '2',
    name: 'نوف محمد الزهراني',
    email: 'nouf.alzahrani@email.com',
    phone: '+966 55 987 6543',
    city: 'جدة',
    signupDate: '2024-01-29T14:15:00Z',
    daysSinceSignup: 4,
    hasOrdered: true,
    firstOrderDate: '2024-01-31T10:20:00Z',
    profileViews: 8,
    itemsViewed: 15,
    cartAbandoned: false,
    estimatedIntent: 'High',
    preferredCategories: ['Body Parts', 'Lights'],
    deviceType: 'Desktop',
  },
  {
    id: '3',
    name: 'خالد أحمد البقمي',
    email: 'khalid.albaqami@email.com',
    phone: '+966 56 234 5678',
    city: 'الدمام',
    signupDate: '2024-01-28T16:45:00Z',
    daysSinceSignup: 5,
    hasOrdered: false,
    profileViews: 6,
    itemsViewed: 8,
    cartAbandoned: false,
    estimatedIntent: 'Medium',
    preferredCategories: ['Electrical'],
    deviceType: 'Mobile',
  },
  {
    id: '4',
    name: 'ريم علي القرني',
    email: 'reem.alqarni@email.com',
    phone: '+966 50 876 5432',
    city: 'مكة المكرمة',
    signupDate: '2024-01-27T11:30:00Z',
    daysSinceSignup: 6,
    hasOrdered: false,
    profileViews: 3,
    itemsViewed: 4,
    cartAbandoned: false,
    estimatedIntent: 'Low',
    preferredCategories: ['Interior'],
    deviceType: 'Tablet',
  },
  {
    id: '5',
    name: 'عمر سعود الحربي',
    email: 'omar.alharbi@email.com',
    phone: '+966 54 345 6789',
    city: 'الرياض',
    signupDate: '2024-01-26T09:15:00Z',
    daysSinceSignup: 7,
    hasOrdered: false,
    profileViews: 15,
    itemsViewed: 32,
    cartAbandoned: true,
    estimatedIntent: 'High',
    preferredCategories: ['Suspension', 'Brakes'],
    deviceType: 'Desktop',
  },
];

const intentColors = {
  High: 'bg-green-100 text-green-800 border-green-300',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Low: 'bg-gray-100 text-gray-800 border-gray-300',
};

const deviceColors = {
  Mobile: 'bg-blue-100 text-blue-800',
  Desktop: 'bg-purple-100 text-purple-800',
  Tablet: 'bg-orange-100 text-orange-800',
};

export default function NewCustomersPage() {
  const [customers, setCustomers] = useState<NewCustomer[]>(mockNewCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntent, setSelectedIntent] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('signupDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isWelcomeDialogOpen, setIsWelcomeDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<NewCustomer | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    const matchesIntent = selectedIntent === 'all' || customer.estimatedIntent === selectedIntent;
    const matchesCity = selectedCity === 'all' || customer.city === selectedCity;
    
    return matchesSearch && matchesIntent && matchesCity;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: any = a[sortBy as keyof NewCustomer];
    let bValue: any = b[sortBy as keyof NewCustomer];
    
    if (sortBy === 'signupDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const uniqueCities = [...new Set(customers.map(customer => customer.city))];
  const totalNewCustomers = customers.length;
  const convertedCustomers = customers.filter(c => c.hasOrdered).length;
  const conversionRate = ((convertedCustomers / totalNewCustomers) * 100).toFixed(1);
  const highIntentCustomers = customers.filter(c => c.estimatedIntent === 'High').length;

  const handleSendWelcome = () => {
    setIsWelcomeDialogOpen(false);
    setWelcomeMessage('');
    toast({
      title: 'Welcome Message Sent',
      description: `Personal welcome message sent to ${selectedCustomer?.name}`,
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="h-8 w-8 text-[#1B6D2F]" />
            New Customers
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome and convert your newest customers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewCustomers}</div>
            <p className="text-xs text-gray-600">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{conversionRate}%</div>
            <p className="text-xs text-gray-600">{convertedCustomers} converted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Intent</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{highIntentCustomers}</div>
            <p className="text-xs text-gray-600">Ready to purchase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Days Since Signup</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(customers.reduce((sum, c) => sum + c.daysSinceSignup, 0) / customers.length)}
            </div>
            <p className="text-xs text-gray-600">Days average</p>
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
                  placeholder="Search new customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedIntent} onValueChange={setSelectedIntent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Purchase Intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intent Levels</SelectItem>
                <SelectItem value="High">High Intent</SelectItem>
                <SelectItem value="Medium">Medium Intent</SelectItem>
                <SelectItem value="Low">Low Intent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="signupDate">Signup Date</SelectItem>
                <SelectItem value="itemsViewed">Items Viewed</SelectItem>
                <SelectItem value="profileViews">Profile Views</SelectItem>
                <SelectItem value="daysSinceSignup">Days Since Signup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* New Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signup</TableHead>
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
                        <Badge className={`${deviceColors[customer.deviceType]} text-xs mt-1`}>
                          {customer.deviceType}
                        </Badge>
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
                      <div className="text-sm">
                        <Eye className="h-3 w-3 inline mr-1" />
                        {customer.itemsViewed} items viewed
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.profileViews} profile views
                      </div>
                      {customer.cartAbandoned && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                          Cart Abandoned
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${intentColors[customer.estimatedIntent]} border`}>
                      {customer.estimatedIntent}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {customer.preferredCategories.slice(0, 2).join(', ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.hasOrdered ? (
                      <div>
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          First Order Placed
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {customer.firstOrderDate && formatDate(customer.firstOrderDate)}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50">
                        Not Yet Ordered
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{formatDate(customer.signupDate)}</div>
                      <div className="text-gray-500">
                        {customer.daysSinceSignup} days ago
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
                            setSelectedCustomer(customer);
                            setIsWelcomeDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Welcome Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Gift className="h-4 w-4 mr-2" />
                          Send Welcome Offer
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
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No new customers found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Welcome Message Dialog */}
      <Dialog open={isWelcomeDialogOpen} onOpenChange={setIsWelcomeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1B6D2F]" />
              Send Welcome Message
            </DialogTitle>
            <DialogDescription>
              Send a personalized welcome message to {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your welcome message..."
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 text-sm mb-1">Welcome Message Tips:</h4>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Thank them for joining</li>
                <li>• Highlight your quality guarantee</li>
                <li>• Offer assistance with finding parts</li>
                <li>• Mention any special welcome offers</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWelcomeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendWelcome} className="bg-[#1B6D2F] hover:bg-[#145A26]">
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}