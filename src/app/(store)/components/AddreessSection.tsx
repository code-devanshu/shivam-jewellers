import { MapPinIcon, PhoneIcon, ClockIcon } from "lucide-react";

export default function AddressSection() {
  return (
    <section className="w-full max-w-6xl mx-auto mt-5 font-serif">
      <h2 className="text-3xl font-semibold text-pink-600 mb-8 text-center">
        Visit Our Boutique
      </h2>
      <div className="p-8 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Address */}
            <div className="flex items-start space-x-4">
              <MapPinIcon className="w-7 h-7 text-pink-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-semibold text-pink-500 mb-1">
                  Address
                </h3>
                <p className="text-gray-800 text-lg">
                  Shivam Jewellers, Mahasay ji ki gali, Malviya road
                </p>
                <p className="text-gray-800 text-lg">Deoria, UP 274001</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <PhoneIcon className="w-7 h-7 text-pink-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-semibold text-pink-500 mb-1">
                  Phone
                </h3>
                <p className="text-gray-800 text-lg">(+91) 8808011114</p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start space-x-4">
              <ClockIcon className="w-7 h-7 text-pink-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-semibold text-pink-500 mb-1">
                  Hours
                </h3>
                <p className="text-gray-800 text-lg">
                  Monday - Friday: 10am - 7pm
                </p>
                <p className="text-gray-800 text-lg">Saturday: 11am - 5pm</p>
                <p className="text-gray-800 text-lg">Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-80 md:h-full rounded-3xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3570.513644974876!2d83.7832004!3d26.5036001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3993c5eed8f3e8a5%3A0x21436dfbacfaba19!2sShivam%20Jewellers!5e0!3m2!1sen!2sin!4v1734595640457!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Elegant Gems Store Location"
              className="rounded-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
