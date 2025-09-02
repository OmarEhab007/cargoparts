'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Archive,
  Search,
  Filter,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  Calendar,
  Package,
  TrendingDown,
  Eye,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ArchivedItem {
  id: string;
  titleAr: string;
  titleEn: string | null;
  sku: string;
  priceSar: number;
  costSar: number;
  lastStock: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: string;
  archivedAt: string;
  archivedReason: 'manual' | 'no_demand' | 'obsolete' | 'damaged' | 'discontinued';
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  lastSold: string | null;
  photos: { url: string }[];
  canRestore: boolean;
}

const mockArchivedItems: ArchivedItem[] = [
  {
    id: '1',
    titleAr: 'مصباح خلفي يمين تويوتا كامري',
    titleEn: 'Toyota Camry Right Tail Light',
    sku: 'TCR-TL-001',
    priceSar: 150,
    costSar: 80,
    lastStock: 2,
    make: 'Toyota',
    model: 'Camry',
    fromYear: 2015,
    toYear: 2018,
    condition: 'Good',
    archivedAt: '2024-01-15T10:30:00Z',
    archivedReason: 'no_demand',
    totalViews: 145,
    totalOrders: 3,
    totalRevenue: 450,
    lastSold: '2023-11-20T14:22:00Z',
    photos: [{ url: '/api/placeholder/300/200' }],
    canRestore: true,
  },
  {
    id: '2',
    titleAr: 'مرآة جانبية يسار نيسان التيما',
    titleEn: 'Nissan Altima Left Side Mirror',
    sku: 'NAL-SM-002',
    priceSar: 200,
    costSar: 120,
    lastStock: 1,
    make: 'Nissan',
    model: 'Altima',
    fromYear: 2016,
    toYear: 2019,
    condition: 'Excellent',
    archivedAt: '2024-02-01T08:15:00Z',
    archivedReason: 'manual',
    totalViews: 89,
    totalOrders: 2,
    totalRevenue: 400,
    lastSold: '2023-12-05T16:45:00Z',
    photos: [{ url: '/api/placeholder/300/200' }],
    canRestore: true,
  },
  {
    id: '3',
    titleAr: 'مقبض باب هوندا أكورد',
    titleEn: 'Honda Accord Door Handle',
    sku: 'HAC-DH-003',
    priceSar: 85,
    costSar: 45,
    lastStock: 3,
    make: 'Honda',
    model: 'Accord',
    fromYear: 2013,
    toYear: 2017,
    condition: 'Good',
    archivedAt: '2024-02-10T12:00:00Z',
    archivedReason: 'obsolete',
    totalViews: 234,
    totalOrders: 7,
    totalRevenue: 595,
    lastSold: '2023-10-15T11:30:00Z',
    photos: [{ url: '/api/placeholder/300/200' }],
    canRestore: false,
  },
  {
    id: '4',
    titleAr: 'فلتر هواء هيونداي النترا',
    titleEn: 'Hyundai Elantra Air Filter',
    sku: 'HEL-AF-004',
    priceSar: 45,
    costSar: 25,
    lastStock: 5,
    make: 'Hyundai',
    model: 'Elantra',
    fromYear: 2014,
    toYear: 2016,
    condition: 'New',
    archivedAt: '2024-02-18T14:20:00Z',
    archivedReason: 'damaged',
    totalViews: 67,
    totalOrders: 1,
    totalRevenue: 45,
    lastSold: '2023-09-28T09:15:00Z',
    photos: [{ url: '/api/placeholder/300/200' }],
    canRestore: false,
  },
  {
    id: '5',
    titleAr: 'شبك أمامي كيا أوبتيما',
    titleEn: 'Kia Optima Front Grille',
    sku: 'KOP-FG-005',
    priceSar: 350,
    costSar: 200,
    lastStock: 1,
    make: 'Kia',
    model: 'Optima',
    fromYear: 2017,
    toYear: 2020,
    condition: 'Excellent',
    archivedAt: '2024-02-25T16:45:00Z',
    archivedReason: 'discontinued',
    totalViews: 312,
    totalOrders: 4,
    totalRevenue: 1400,
    lastSold: '2024-01-08T13:20:00Z',
    photos: [{ url: '/api/placeholder/300/200' }],
    canRestore: true,
  },
];

const archiveReasonLabels = {
  manual: { ar: 'أرشفة يدوية', en: 'Manual Archive' },
  no_demand: { ar: 'عدم طلب', en: 'No Demand' },
  obsolete: { ar: 'منتج قديم', en: 'Obsolete' },
  damaged: { ar: 'تالف', en: 'Damaged' },
  discontinued: { ar: 'متوقف', en: 'Discontinued' },
};

const archiveReasonColors = {
  manual: 'bg-blue-100 text-blue-800',
  no_demand: 'bg-orange-100 text-orange-800',
  obsolete: 'bg-gray-100 text-gray-800',
  damaged: 'bg-red-100 text-red-800',
  discontinued: 'bg-purple-100 text-purple-800',
};

export default function ArchivedInventoryPage() {
  const [items, setItems] = useState<ArchivedItem[]>(mockArchivedItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('archivedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [restoreItemId, setRestoreItemId] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesReason = selectedReason === 'all' || item.archivedReason === selectedReason;
    const matchesMake = selectedMake === 'all' || item.make === selectedMake;
    
    return matchesSearch && matchesReason && matchesMake;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue: any = a[sortBy as keyof ArchivedItem];
    let bValue: any = b[sortBy as keyof ArchivedItem];
    
    if (sortBy === 'archivedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const uniqueMakes = [...new Set(items.map(item => item.make))];
  const restorableCount = items.filter(item => item.canRestore).length;
  const totalArchivedValue = items.reduce((sum, item) => sum + item.totalRevenue, 0);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(sortedItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleRestoreItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item?.canRestore) {
      toast({
        title: 'Cannot Restore Item',
        description: 'This item cannot be restored due to its condition.',
        variant: 'destructive',
      });
      return;
    }

    setItems(prev => prev.filter(item => item.id !== itemId));
    setIsRestoreDialogOpen(false);
    setRestoreItemId(null);
    toast({
      title: 'Item Restored',
      description: 'The item has been moved back to active inventory.',
      variant: 'success',
    });
  };

  const handleBulkRestore = () => {
    const restorableSelected = selectedItems.filter(id => 
      items.find(item => item.id === id)?.canRestore
    );
    
    if (restorableSelected.length === 0) {
      toast({
        title: 'No Restorable Items',
        description: 'None of the selected items can be restored.',
        variant: 'destructive',
      });
      return;
    }

    setItems(prev => prev.filter(item => !restorableSelected.includes(item.id)));
    setSelectedItems([]);
    toast({
      title: `${restorableSelected.length} Items Restored`,
      description: 'Selected items have been moved back to active inventory.',
      variant: 'success',
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setIsDeleteDialogOpen(false);
    setDeleteItemId(null);
    toast({
      title: 'Item Permanently Deleted',
      description: 'The item has been permanently removed from the system.',
      variant: 'success',
    });
  };

  const handleBulkDelete = () => {
    setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    toast({
      title: `${selectedItems.length} Items Deleted`,
      description: 'Selected items have been permanently removed.',
      variant: 'success',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysArchived = (archivedAt: string) => {
    const days = Math.floor((Date.now() - new Date(archivedAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Archived Inventory</h1>
          <p className="text-gray-600 mt-1">
            Manage archived and discontinued inventory items
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleBulkRestore}
            disabled={selectedItems.length === 0 || !selectedItems.some(id => 
              items.find(item => item.id === id)?.canRestore
            )}
            className="bg-[#1B6D2F] hover:bg-[#145A26]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore Selected
          </Button>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={selectedItems.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Permanently
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archived</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-gray-600">Items in archive</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restorable</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B6D2F]">{restorableCount}</div>
            <p className="text-xs text-gray-600">Can be restored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR {totalArchivedValue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">Historical revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Archive Time</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(items.reduce((sum, item) => sum + getDaysArchived(item.archivedAt), 0) / items.length)} days
            </div>
            <p className="text-xs text-gray-600">Average archived</p>
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
                  placeholder="Search archived items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Archive Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="manual">Manual Archive</SelectItem>
                <SelectItem value="no_demand">No Demand</SelectItem>
                <SelectItem value="obsolete">Obsolete</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMake} onValueChange={setSelectedMake}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                {uniqueMakes.map(make => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="archivedAt">Archive Date</SelectItem>
                <SelectItem value="totalRevenue">Revenue</SelectItem>
                <SelectItem value="totalViews">Views</SelectItem>
                <SelectItem value="totalOrders">Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === sortedItems.length && sortedItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead>Archive Reason</TableHead>
                <TableHead>Archived Date</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.photos[0]?.url}
                        alt={item.titleEn || item.titleAr}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.titleEn || item.titleAr}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {item.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.make} {item.model}</div>
                      <div className="text-sm text-gray-500">
                        {item.fromYear}-{item.toYear}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${archiveReasonColors[item.archivedReason]} border-0`}>
                      {archiveReasonLabels[item.archivedReason].en}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatDate(item.archivedAt)}</div>
                      <div className="text-sm text-gray-500">
                        {getDaysArchived(item.archivedAt)} days ago
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Eye className="h-3 w-3 mr-1 text-gray-400" />
                        {item.totalViews} views
                      </div>
                      <div className="flex items-center text-sm">
                        <Package className="h-3 w-3 mr-1 text-gray-400" />
                        {item.totalOrders} orders
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">SAR {item.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total revenue</div>
                  </TableCell>
                  <TableCell>
                    {item.canRestore ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Restorable
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                        Permanent
                      </Badge>
                    )}
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
                            setRestoreItemId(item.id);
                            setIsRestoreDialogOpen(true);
                          }}
                          disabled={!item.canRestore}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore to Active
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteItemId(item.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedItems.length === 0 && (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No archived items found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-[#1B6D2F]" />
              Restore Item to Active Inventory
            </DialogTitle>
            <DialogDescription>
              This will move the item back to your active inventory and make it available for sale.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => restoreItemId && handleRestoreItem(restoreItemId)}
              className="bg-[#1B6D2F] hover:bg-[#145A26]"
            >
              Restore Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Permanently Delete Item
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The item and all its data will be permanently removed from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteItemId && handleDeleteItem(deleteItemId)}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}