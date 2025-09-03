import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Car, 
  ShoppingCart, 
  Search, 
  Star,
  Package,
  Shield
} from "lucide-react"

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Saudi Identity */}
      <section className="relative overflow-hidden bg-gradient-saudi text-white">
        <div className="pattern-saudi" />
        <div className="container mx-auto px-4 py-20">
          <h1 className="text-5xl font-black mb-4">
            نظام التصميم السعودي
          </h1>
          <p className="text-xl mb-8 opacity-90">
            مستوحى من رؤية الرياض 2030 والتراث السعودي الأصيل
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button variant="gold" size="lg">
              استكشف المكونات
            </Button>
            <Button variant="goldOutline" size="lg">
              دليل الاستخدام
            </Button>
          </div>
        </div>
      </section>

      {/* Color Palette Showcase */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-gradient-saudi">
          لوحة الألوان السعودية
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="w-full h-32 bg-saudi-green rounded-lg shadow-lg mb-3" />
            <h3 className="font-bold">الأخضر السعودي</h3>
            <p className="text-sm text-muted-foreground">الهوية الوطنية</p>
          </div>
          <div className="text-center">
            <div className="w-full h-32 bg-desert-gold rounded-lg shadow-lg mb-3" />
            <h3 className="font-bold">ذهبي الصحراء</h3>
            <p className="text-sm text-muted-foreground">الفخامة والتراث</p>
          </div>
          <div className="text-center">
            <div className="w-full h-32 bg-riyadh-sky rounded-lg shadow-lg mb-3" />
            <h3 className="font-bold">سماء الرياض</h3>
            <p className="text-sm text-muted-foreground">الوضوح والحداثة</p>
          </div>
          <div className="text-center">
            <div className="w-full h-32 bg-palm-green rounded-lg shadow-lg mb-3" />
            <h3 className="font-bold">أخضر النخيل</h3>
            <p className="text-sm text-muted-foreground">الواحة والطبيعة</p>
          </div>
        </div>

        {/* Gradient Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-24 bg-gradient-saudi rounded-lg shadow-lg flex items-center justify-center text-white font-bold">
            تدرج سعودي
          </div>
          <div className="h-24 bg-gradient-desert rounded-lg shadow-lg flex items-center justify-center text-saudi-green-dark font-bold">
            تدرج صحراوي
          </div>
          <div className="h-24 bg-gradient-sky rounded-lg shadow-lg flex items-center justify-center text-saudi-green-dark font-bold">
            تدرج سماوي
          </div>
          <div className="h-24 bg-gradient-oasis rounded-lg shadow-lg flex items-center justify-center text-white font-bold">
            تدرج الواحة
          </div>
        </div>
      </section>

      {/* Button Variants */}
      <section className="container mx-auto px-4 py-16 bg-sand-beige/20">
        <h2 className="text-3xl font-bold mb-8 text-gradient-saudi">
          أنماط الأزرار
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Button variant="saudi" size="default">
            زر سعودي أساسي
          </Button>
          <Button variant="gold" size="default">
            زر ذهبي
          </Button>
          <Button variant="premium" size="default">
            زر مميز
          </Button>
          <Button variant="saudiOutline" size="default">
            إطار سعودي
          </Button>
          <Button variant="goldOutline" size="default">
            إطار ذهبي
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button variant="saudi" size="sm">حجم صغير</Button>
          <Button variant="saudi" size="default">حجم متوسط</Button>
          <Button variant="saudi" size="lg">حجم كبير</Button>
          <Button variant="saudi" size="xl">حجم ضخم</Button>
        </div>
      </section>

      {/* Card Components */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-gradient-saudi">
          بطاقات المنتجات
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Standard Saudi Card */}
          <div className="card-saudi">
            <div className="flex justify-between items-start mb-4">
              <div className="icon-saudi">
                <Car className="w-6 h-6" />
              </div>
              <Badge className="badge-saudi">متوفر</Badge>
            </div>
            <h3 className="text-xl font-bold mb-2">قطع غيار أصلية</h3>
            <p className="text-muted-foreground mb-4">
              قطع غيار معتمدة من الوكيل الرسمي
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-saudi-green">350 ر.س</span>
              <Button variant="saudi" size="sm">
                <ShoppingCart className="w-4 h-4 ms-2" />
                أضف للسلة
              </Button>
            </div>
          </div>

          {/* Premium Card */}
          <div className="card-saudi-premium">
            <div className="absolute top-0 end-0 badge-premium">
              <Star className="w-4 h-4 inline me-1" />
              مميز
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="icon-gold">
                <Package className="w-6 h-6" />
              </div>
              <div className="text-desert-gold">
                <Star className="w-5 h-5 fill-current inline" />
                <Star className="w-5 h-5 fill-current inline" />
                <Star className="w-5 h-5 fill-current inline" />
                <Star className="w-5 h-5 fill-current inline" />
                <Star className="w-5 h-5 fill-current inline" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gradient-gold">
              قطع غيار فاخرة
            </h3>
            <p className="text-muted-foreground mb-4">
              أعلى جودة مع ضمان ذهبي شامل
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-desert-gold">1,250 ر.س</span>
              <Button variant="gold" size="sm">
                <ShoppingCart className="w-4 h-4 ms-2" />
                اشترِ الآن
              </Button>
            </div>
          </div>

          {/* Glass Effect Card */}
          <div className="glass-saudi p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="icon-saudi">
                <Shield className="w-6 h-6" />
              </div>
              <span className="status-active" />
            </div>
            <h3 className="text-xl font-bold mb-2">ضمان شامل</h3>
            <p className="text-muted-foreground mb-4">
              حماية كاملة لقطع الغيار
            </p>
            <Button variant="saudiOutline" className="w-full">
              تفاصيل الضمان
            </Button>
          </div>
        </div>
      </section>

      {/* Badge Styles */}
      <section className="container mx-auto px-4 py-16 bg-sand-beige/20">
        <h2 className="text-3xl font-bold mb-8 text-gradient-saudi">
          الشارات والعلامات
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <span className="badge-saudi">جديد</span>
          <span className="badge-gold">مميز</span>
          <span className="badge-premium shimmer-gold">حصري</span>
          <Badge className="bg-palm-green text-white">متوفر</Badge>
          <Badge className="bg-riyadh-sky text-saudi-green-dark">قريباً</Badge>
          <Badge className="bg-date-brown text-white">نفذ المخزون</Badge>
        </div>
      </section>

      {/* Typography Examples */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-gradient-saudi">
          الخطوط والنصوص
        </h2>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-5xl font-black text-gradient-saudi mb-2">
              عنوان رئيسي بتدرج سعودي
            </h1>
            <p className="text-muted-foreground">خط Cairo بوزن 900</p>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gradient-gold mb-2">
              عنوان فرعي بتدرج ذهبي
            </h2>
            <p className="text-muted-foreground">خط Cairo بوزن 800</p>
          </div>
          
          <div>
            <p className="text-lg leading-relaxed">
              نص عادي باللغة العربية مع تباعد أسطر محسّن لتحسين القراءة. 
              يستخدم خط Cairo مع وزن 400 وتباعد أحرف مناسب للغة العربية.
            </p>
          </div>
          
          <div className="text-price text-saudi-green">
            1,999 ر.س
          </div>
        </div>
      </section>

      {/* Interactive Components */}
      <section className="container mx-auto px-4 py-16 bg-sand-beige/20">
        <h2 className="text-3xl font-bold mb-8 text-gradient-saudi">
          مكونات تفاعلية
        </h2>
        
        <div className="max-w-2xl space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-saudi-green w-5 h-5" />
            <Input 
              placeholder="ابحث عن قطع الغيار..." 
              className="ps-10 border-saudi-green/30 focus:border-saudi-green"
            />
          </div>
          
          {/* Form Elements */}
          <div className="card-saudi">
            <h3 className="text-xl font-bold mb-4">معلومات السيارة</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="car-make">الماركة</Label>
                <Input id="car-make" placeholder="تويوتا، نيسان، هيونداي..." />
              </div>
              <div>
                <Label htmlFor="car-model">الموديل</Label>
                <Input id="car-model" placeholder="كامري، ألتيما، سوناتا..." />
              </div>
              <div>
                <Label htmlFor="car-year">السنة</Label>
                <Input id="car-year" placeholder="2024" />
              </div>
              <Button variant="saudi" className="w-full">
                البحث عن القطع المناسبة
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Special Effects */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-gradient-saudi">
          تأثيرات خاصة
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-4">تأثير اللمعان السعودي</h3>
            <div className="h-20 bg-saudi-green rounded shimmer-saudi" />
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-4">تأثير اللمعان الذهبي</h3>
            <div className="h-20 bg-desert-gold rounded shimmer-gold" />
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-4">مؤشر النشاط</h3>
            <div className="flex items-center gap-3">
              <span className="status-active" />
              <span>الخدمة متاحة</span>
            </div>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-bold mb-4">نمط هندسي</h3>
            <div className="relative h-20 bg-sand-beige rounded pattern-saudi" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-saudi text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black mb-2">٥٠٠+</div>
              <div className="text-pearl-white/80">متجر شريك</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">١٠٠ ألف</div>
              <div className="text-pearl-white/80">قطعة غيار</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">٢٤/٧</div>
              <div className="text-pearl-white/80">دعم متواصل</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">٩٨٪</div>
              <div className="text-pearl-white/80">رضا العملاء</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-saudi-green-dark text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">
            نظام تصميم مستوحى من رؤية السعودية ٢٠٣٠
          </h3>
          <p className="text-pearl-white/80">
            يجمع بين الأصالة والحداثة لتقديم تجربة مستخدم فريدة
          </p>
        </div>
      </footer>
    </div>
  )
}