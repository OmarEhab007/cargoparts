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
  Crown,
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
  Award,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VIPCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar?: string;
  vipTier: 'Gold' | 'Platinum' | 'Diamond';
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  joinedDate: string;
  rating: number;
  preferredCategories: string[];
  loyaltyPoints: number;
  lifetimeValue: number;
}

const mockVipCustomers: VIPCustomer[] = [
  {
    id: '1',
    name: 'محمد عبد الله السعود',
    email: 'mohammed.alsaud@email.com',
    phone: '+966 50 123 4567',
    city: 'الرياض',
    vipTier: 'Diamond',
    totalOrders: 45,
    totalSpent: 125000,
    averageOrderValue: 2777,
    lastOrderDate: '2024-01-28T10:30:00Z',
    joinedDate: '2022-03-15T08:00:00Z',
    rating: 4.9,
    preferredCategories: ['Engines', 'Transmission'],
    loyaltyPoints: 12500,
    lifetimeValue: 150000,
  },
  {
    id: '2',
    name: 'أحمد محمد الجبر',
    email: 'ahmed.aljaber@email.com',
    phone: '+966 55 987 6543',
    city: 'جدة',
    vipTier: 'Platinum',
    totalOrders: 32,
    totalSpent: 89000,
    averageOrderValue: 2781,
    lastOrderDate: '2024-01-25T14:15:00Z',
    joinedDate: '2022-07-22T10:30:00Z',
    rating: 4.8,
    preferredCategories: ['Body Parts', 'Lights'],
    loyaltyPoints: 8900,
    lifetimeValue: 95000,
  },
  {
    id: '3',
    name: 'فهد علي القحطاني',
    email: 'fahad.alqahtani@email.com',
    phone: '+966 56 234 5678',
    city: 'الدمام',
    vipTier: 'Gold',
    totalOrders: 28,
    totalSpent: 67000,
    averageOrderValue: 2393,
    lastOrderDate: '2024-01-20T09:45:00Z',
    joinedDate: '2023-01-10T14:20:00Z',
    rating: 4.7,
    preferredCategories: ['Suspension', 'Brakes'],
    loyaltyPoints: 6700,
    lifetimeValue: 72000,
  },
  {
    id: '4',
    name: 'عبد الرحمن خالد النمر',
    email: 'abdurahman.alnimer@email.com',
    phone: '+966 50 876 5432',
    city: 'مكة المكرمة',
    vipTier: 'Platinum',
    totalOrders: 35,
    totalSpent: 92000,
    averageOrderValue: 2629,
    lastOrderDate: '2024-01-30T16:20:00Z',
    joinedDate: '2022-11-05T11:15:00Z',
    rating: 4.8,
    preferredCategories: ['Electrical', 'Interior'],
    loyaltyPoints: 9200,
    lifetimeValue: 98000,
  },
];

const tierColors = {
  Gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Platinum: 'bg-gray-100 text-gray-800 border-gray-300',
  Diamond: 'bg-blue-100 text-blue-800 border-blue-300',
};

const tierIcons = {
  Gold: '🥇',
  Platinum: '🥈', 
  Diamond: '💎',
};

export default function VIPCustomersPage() {
  const [customers, setCustomers] = useState<VIPCustomer[]>(mockVipCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('totalSpent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<VIPCustomer | null>(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    const matchesTier = selectedTier === 'all' || customer.vipTier === selectedTier;
    const matchesCity = selectedCity === 'all' || customer.city === selectedCity;
    
    return matchesSearch && matchesTier && matchesCity;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: any = a[sortBy as keyof VIPCustomer];
    let bValue: any = b[sortBy as keyof VIPCustomer];
    
    if (sortBy === 'lastOrderDate' || sortBy === 'joinedDate') {
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
  const totalVipSpending = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const averageLifetimeValue = customers.reduce((sum, customer) => sum + customer.lifetimeValue, 0) / customers.length;

  const handleSendOffer = () => {
    setIsOfferDialogOpen(false);
    toast({
      title: 'Exclusive Offer Sent',
      description: `Special VIP offer sent to ${selectedCustomer?.name}`,
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
            <Crown className="h-8 w-8 text-yellow-500" />
            VIP Customers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your most valuable customers with exclusive benefits
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VIP Customers</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-gray-600">Elite customer base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VIP Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B6D2F]">SAR {totalVipSpending.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Cumulative revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lifetime Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR {Math.round(averageLifetimeValue).toLocaleString()}</div>
            <p className="text-xs text-gray-600">Per VIP customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diamond Tier</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter(c => c.vipTier === 'Diamond').length}</div>
            <p className="text-xs text-gray-600">Premium customers</p>
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
                  placeholder="Search VIP customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="VIP Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Diamond">💎 Diamond</SelectItem>
                <SelectItem value="Platinum">🥈 Platinum</SelectItem>
                <SelectItem value="Gold">🥇 Gold</SelectItem>
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
                <SelectItem value="totalSpent">Total Spent</SelectItem>
                <SelectItem value="lifetimeValue">Lifetime Value</SelectItem>
                <SelectItem value="totalOrders">Total Orders</SelectItem>
                <SelectItem value="lastOrderDate">Last Order</SelectItem>
                <SelectItem value="loyaltyPoints">Loyalty Points</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* VIP Customers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>VIP Tier</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Loyalty</TableHead>
                <TableHead>Last Order</TableHead>
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
                    <Badge className={`${tierColors[customer.vipTier]} border`}>
                      {tierIcons[customer.vipTier]} {customer.vipTier}
                    </Badge>
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
                    <div className="space-y-1">
                      <div className="font-medium text-yellow-600">
                        {customer.loyaltyPoints.toLocaleString()} pts
                      </div>
                      <div className="text-sm text-gray-500">
                        LTV: SAR {customer.lifetimeValue.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{formatDate(customer.lastOrderDate)}</div>
                      <div className="text-gray-500">
                        Member since {new Date(customer.joinedDate).getFullYear()}
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
                            setIsOfferDialogOpen(true);
                          }}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Send Exclusive Offer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          View Order History
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
              <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No VIP customers found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exclusive Offer Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#1B6D2F]" />
              Send Exclusive VIP Offer
            </DialogTitle>
            <DialogDescription>
              Send a personalized exclusive offer to {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">VIP Perks Available:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 25% discount on next purchase</li>
                <li>• Free priority shipping</li>
                <li>• Extended warranty coverage</li>
                <li>• Early access to new inventory</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendOffer} className="bg-[#1B6D2F] hover:bg-[#145A26]">
              Send Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}