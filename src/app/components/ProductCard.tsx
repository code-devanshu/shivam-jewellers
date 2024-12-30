import Image from "next/legacy/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IndianRupee, Star } from "lucide-react";
import Link from "next/link";

interface JewelryProductProps {
  id: string;
  name: string;
  price: number;
  description: string;
  material?: string;
  image: string;
  rating?: number;
  category?: string;
  subcategory?: string;
  gender: "Men" | "Women" | "Unisex";
  isLoggedIn: boolean; // Prop to check if the user is logged in
}

export default function JewelryProductCard({
  id,
  name,
  price,
  description,
  material,
  image,
  rating,
  category,
  subcategory,
  gender,
  isLoggedIn,
}: JewelryProductProps) {
  // WhatsApp message link
  const whatsappMessage = `https://wa.me/+918808011114/?text=${encodeURIComponent(
    `Hi, I am interested in this product: ${name}. Here is the link: https://shivamjewellers.co.in/products/${id}`
  )}`;

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-white shadow-lg transition-transform transform hover:shadow-xl rounded-lg">
      <Link href={`/products/${id}`}>
        <CardHeader className="p-0">
          <div className="relative overflow-hidden cursor-pointer h-60 w-full">
            <Image
              src={image}
              alt={name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 ease-in-out hover:scale-110 rounded-t-lg"
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {name}
          </CardTitle>
          {rating && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < rating
                      ? "text-yellow-500 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mb-4">
          {isLoggedIn ? (
            <span className="text-xl font-semibold text-yellow-600 flex items-center">
              <IndianRupee className="inline h-5 mr-1" />
              {price.toFixed(2)}
            </span>
          ) : (
            <Tooltip>
              <TooltipTrigger>
                {/* Blurred Price */}
                <span
                  className="text-xl font-semibold text-yellow-600 flex items-center cursor-pointer"
                  style={{
                    textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                    filter: "blur(3px)",
                    opacity: 0.7,
                  }}
                >
                  <IndianRupee className="inline h-5 mr-1" />
                  {100000}
                </span>
              </TooltipTrigger>
              <TooltipContent
                className="bg-gray-600 text-white px-4 py-2 text-sm rounded-md shadow-lg z-50 ms-12"
                side="top"
                align="center"
              >
                Login to view the price
              </TooltipContent>
            </Tooltip>
          )}
          {material && (
            <Badge
              variant="secondary"
              className="px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
            >
              Material: {material}
            </Badge>
          )}
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge
              variant="outline"
              className="px-3 py-1 rounded-full text-sm bg-yellow-50 text-yellow-600 border-yellow-500"
            >
              {category}
            </Badge>
          )}
          {subcategory && (
            <Badge
              variant="outline"
              className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-600 border-blue-500"
            >
              {subcategory}
            </Badge>
          )}
          <Badge
            variant="destructive"
            className="px-3 py-1 rounded-full text-sm bg-pink-50 text-pink-600 border-pink-500"
          >
            {gender}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        {/* WhatsApp Link */}
        <a
          href={whatsappMessage}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button className="w-full bg-yellow-600 text-white hover:bg-yellow-700">
            Get Details
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
