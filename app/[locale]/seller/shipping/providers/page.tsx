'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Truck,
  MoreHorizontal,
  Settings,
  TrendingUp,
  Star,
  Clock,
  DollarSign,
  Package,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShippingProvider {
  id: string;
  name: string;
  nameAr: string;
  logo?: string;
  status: 'active' | 'inactive';
  rating: number;
  baseRate: number;
  deliveryTime: string;
  coverage: string[];
  totalShipments: number;
  successRate: number;
  lastUsed: string;
}

const mockProviders: ShippingProvider[] = [
  {
    id: '1',
    name: 'SMSA Express',
    nameAr: 'سمسا إكسبريس',
    status: 'active',
    rating: 4.5,
    baseRate: 15,
    deliveryTime: '1-2 days',
    coverage: ['الرياض', 'جدة', 'الدمام', 'مكة'],
    totalShipments: 1250,
    successRate: 98.5,
    lastUsed: '2024-02-01T10:30:00Z',
  },
  {
    id: '2', 
    name: 'Aramex',
    nameAr: 'أرامكس',
    status: 'active',
    rating: 4.2,
    baseRate: 18,
    deliveryTime: '2-3 days', 
    coverage: ['الرياض', 'جدة', 'الطائف'],
    totalShipments: 850,
    successRate: 96.8,
    lastUsed: '2024-01-30T14:20:00Z',
  },
];

export default function ShippingProvidersPage() {
  const [providers, setProviders] = useState<ShippingProvider[]>(mockProviders);

  const handleToggleStatus = (providerId: string) => {
    setProviders(prev => prev.map(provider => 
      provider.id === providerId 
        ? { ...provider, status: provider.status === 'active' ? 'inactive' as const : 'active' as const }
        : provider
    ));
    toast({
      title: 'Provider Status Updated',
      description: 'Shipping provider status has been updated.',
      variant: 'success',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="h-8 w-8 text-[#1B6D2F]" />
            Shipping Providers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your shipping partners and delivery services
          </p>
        </div>
        <Button className="bg-[#1B6D2F] hover:bg-[#145A26]">
          Add Provider
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
            <Truck className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-gray-600">Available for shipping</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {providers.reduce((sum, p) => sum + p.totalShipments, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">All providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(providers.reduce((sum, p) => sum + p.successRate, 0) / providers.length).toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">Delivery success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Base Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              SAR {(providers.reduce((sum, p) => sum + p.baseRate, 0) / providers.length).toFixed(0)}
            </div>
            <p className="text-xs text-gray-600">Average cost</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Rates & Speed</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Truck className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{provider.name}</div>
                        <div className="text-sm text-gray-500">{provider.nameAr}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={provider.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                      }
                    >
                      {provider.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{provider.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {provider.totalShipments.toLocaleString()} shipments
                      </div>
                      <div className="text-sm text-green-600">
                        {provider.successRate}% success
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">SAR {provider.baseRate}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {provider.deliveryTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {provider.coverage.slice(0, 2).join(', ')}
                      {provider.coverage.length > 2 && ` +${provider.coverage.length - 2}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(provider.lastUsed).toLocaleDateString()}
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
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(provider.id)}>
                          {provider.status === 'active' ? 'Deactivate' : 'Activate'}
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