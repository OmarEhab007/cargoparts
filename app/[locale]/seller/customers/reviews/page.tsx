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
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  Search,
  MoreHorizontal,
  MessageSquare,
  Flag,
  TrendingUp,
  ThumbsUp,
  Calendar,
  Package,
  User,
  Eye,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  productName: string;
  productSku: string;
  orderDate: string;
  reviewDate: string;
  verified: boolean;
  helpful: number;
  responded: boolean;
  response?: string;
  responseDate?: string;
  status: 'pending' | 'approved' | 'flagged';
  photos: string[];
}

const mockReviews: CustomerReview[] = [
  {
    id: '1',
    customerName: 'أحمد محمد السعود',
    customerEmail: 'ahmed.alsaud@email.com',
    rating: 5,
    title: 'قطعة ممتازة وخدمة رائعة',
    comment: 'وصلت القطعة بحالة ممتازة وتم تركيبها بسهولة. الخدمة سريعة والتعامل محترف جداً. أنصح بالتعامل مع هذا المتجر.',
    productName: 'مصباح خلفي يمين تويوتا كامري',
    productSku: 'TCR-TL-001',
    orderDate: '2024-01-20T10:30:00Z',
    reviewDate: '2024-01-25T14:20:00Z',
    verified: true,
    helpful: 8,
    responded: true,
    response: 'شكراً لك على التقييم الرائع! نحن سعداء بخدمتك ونتطلع للتعامل معك مرة أخرى.',
    responseDate: '2024-01-25T16:30:00Z',
    status: 'approved',
    photos: ['/api/placeholder/150/150'],
  },
  {
    id: '2',
    customerName: 'فاطمة علي الحربي',
    customerEmail: 'fatima.alharbi@email.com',
    rating: 4,
    title: 'قطعة جيدة لكن التسليم متأخر قليلاً',
    comment: 'جودة القطعة ممتازة وتطابق المواصفات، لكن التسليم تأخر يومين عن الموعد المحدد. بشكل عام راضية عن الشراء.',
    productName: 'فلتر زيت هوندا أكورد',
    productSku: 'HAC-OF-002',
    orderDate: '2024-01-18T09:15:00Z',
    reviewDate: '2024-01-28T11:45:00Z',
    verified: true,
    helpful: 3,
    responded: false,
    status: 'pending',
    photos: [],
  },
  {
    id: '3',
    customerName: 'محمد خالد القحطاني',
    customerEmail: 'mohammed.alqahtani@email.com',
    rating: 5,
    title: 'أفضل متجر قطع غيار في السعودية',
    comment: 'تعاملت مع المتجر عدة مرات وفي كل مرة أجد الخدمة ممتازة. القطع أصلية والأسعار معقولة جداً. استمروا على هذا المستوى.',
    productName: 'مضخة مياه نيسان التيما',
    productSku: 'NAL-WP-003',
    orderDate: '2024-01-22T13:20:00Z',
    reviewDate: '2024-01-30T08:30:00Z',
    verified: true,
    helpful: 12,
    responded: true,
    response: 'نشكرك جداً على كلماتك الرائعة! هذا يشجعنا على تقديم الأفضل دائماً لعملائنا المميزين.',
    responseDate: '2024-01-30T10:15:00Z',
    status: 'approved',
    photos: ['/api/placeholder/150/150', '/api/placeholder/150/150'],
  },
  {
    id: '4',
    customerName: 'سارة عبد الرحمن النمر',
    customerEmail: 'sara.alnimer@email.com',
    rating: 2,
    title: 'القطعة لا تطابق المواصفات',
    comment: 'للأسف القطعة التي وصلت لا تطابق سيارتي رغم التأكد من رقم الشاسيه. اضطررت لإرجاعها وطلب استبدال.',
    productName: 'مرآة جانبية يسار كيا أوبتيما',
    productSku: 'KOP-SM-004',
    orderDate: '2024-01-15T16:40:00Z',
    reviewDate: '2024-01-29T12:10:00Z',
    verified: true,
    helpful: 1,
    responded: false,
    status: 'flagged',
    photos: [],
  },
  {
    id: '5',
    customerName: 'عبد الله سعود الدوسري',
    customerEmail: 'abdullah.aldosari@email.com',
    rating: 5,
    title: 'سرعة في التوصيل وجودة عالية',
    comment: 'طلبت قطعة عاجلة وتم توصيلها في نفس اليوم! الجودة ممتازة والسعر مناسب. خدمة عملاء رائعة.',
    productName: 'بطارية سيارة هيونداي النترا',
    productSku: 'HEL-BAT-005',
    orderDate: '2024-01-26T07:30:00Z',
    reviewDate: '2024-01-27T19:20:00Z',
    verified: true,
    helpful: 6,
    responded: true,
    response: 'شكراً لك على التقييم الممتاز! نحن نسعى دائماً لتوفير خدمة سريعة وموثوقة.',
    responseDate: '2024-01-28T09:00:00Z',
    status: 'approved',
    photos: ['/api/placeholder/150/150'],
  },
];

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(mockReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('reviewDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [responseText, setResponseText] = useState('');

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchQuery === '' || 
      review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.productName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = selectedRating === 'all' || review.rating.toString() === selectedRating;
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
    
    return matchesSearch && matchesRating && matchesStatus;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    let aValue: any = a[sortBy as keyof CustomerReview];
    let bValue: any = b[sortBy as keyof CustomerReview];
    
    if (sortBy === 'reviewDate' || sortBy === 'orderDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const responseRate = (reviews.filter(r => r.responded).length / reviews.length * 100).toFixed(1);

  const handleSendResponse = () => {
    if (!selectedReview || !responseText.trim()) return;

    setReviews(prev => prev.map(review => 
      review.id === selectedReview.id 
        ? { 
            ...review, 
            responded: true, 
            response: responseText,
            responseDate: new Date().toISOString(),
            status: 'approved' as const
          }
        : review
    ));

    setIsResponseDialogOpen(false);
    setResponseText('');
    setSelectedReview(null);
    
    toast({
      title: 'Response Sent',
      description: 'Your response has been sent to the customer.',
      variant: 'success',
    });
  };

  const handleApproveReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, status: 'approved' as const } : review
    ));
    
    toast({
      title: 'Review Approved',
      description: 'The review has been approved and is now visible.',
      variant: 'success',
    });
  };

  const handleFlagReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, status: 'flagged' as const } : review
    ));
    
    toast({
      title: 'Review Flagged',
      description: 'The review has been flagged for moderation.',
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'flagged':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            Reviews & Ratings
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and respond to customer reviews and feedback
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-gray-600">Customer feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#1B6D2F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B6D2F]">{averageRating.toFixed(1)}</div>
            <div className="flex">
              {renderStars(Math.round(averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Eye className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReviews}</div>
            <p className="text-xs text-gray-600">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{responseRate}%</div>
            <p className="text-xs text-gray-600">Reviews responded</p>
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
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewDate">Review Date</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="helpful">Helpful Votes</SelectItem>
                <SelectItem value="orderDate">Order Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.customerAvatar} />
                        <AvatarFallback>{getInitials(review.customerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{review.customerName}</div>
                        {review.verified && (
                          <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">{review.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{review.comment}</div>
                      {review.photos.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {review.photos.slice(0, 3).map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt=""
                              className="w-8 h-8 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      {review.helpful > 0 && (
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {review.helpful} found helpful
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{review.productName}</div>
                      <div className="text-sm text-gray-500">SKU: {review.productSku}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge className={`${getStatusColor(review.status)} border`}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </Badge>
                      {review.responded && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 block">
                          Responded
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{formatDate(review.reviewDate)}</div>
                      <div className="text-gray-500">
                        Order: {formatDate(review.orderDate)}
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
                        {!review.responded && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReview(review);
                              setIsResponseDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Respond to Review
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {review.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleApproveReview(review.id)}>
                            <User className="h-4 w-4 mr-2" />
                            Approve Review
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleFlagReview(review.id)}>
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedReviews.length === 0 && (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1B6D2F]" />
              Respond to Review
            </DialogTitle>
            <DialogDescription>
              Send a thoughtful response to {selectedReview?.customerName}'s review
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              {/* Review Summary */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="font-medium">{selectedReview.title}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedReview.comment}</p>
              </div>
              
              {/* Response Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Response
                </label>
                <Textarea
                  placeholder="Write a professional and helpful response..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              {/* Response Tips */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 text-sm mb-1">Response Best Practices:</h4>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• Thank the customer for their feedback</li>
                  <li>• Address any specific concerns mentioned</li>
                  <li>• Keep the tone professional and helpful</li>
                  <li>• Offer solutions or next steps if needed</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendResponse}
              disabled={!responseText.trim()}
              className="bg-[#1B6D2F] hover:bg-[#145A26]"
            >
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}