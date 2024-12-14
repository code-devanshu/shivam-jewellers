import { MapPinIcon, PhoneIcon, ClockIcon } from "lucide-react";

export default function AddressSection() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 my-16">
      <h2 className="text-3xl font-semibold text-yellow-400 mb-8 text-center">
        Visit Our Boutique
      </h2>
      <div className="bg-black bg-opacity-50 p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPinIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-yellow-200">
                  Address
                </h3>
                <p className="text-white">
                  Shivam Jewellers, Mahasay ji ki gali, Malviya road
                </p>
                <p className="text-white">Deoria, UP 274001</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <PhoneIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-yellow-200">Phone</h3>
                <p className="text-white">(+91) 8808011114</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ClockIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-yellow-200">Hours</h3>
                <p className="text-white">Monday - Friday: 10am - 7pm</p>
                <p className="text-white">Saturday: 11am - 5pm</p>
                <p className="text-white">Sunday: Closed</p>
              </div>
            </div>
          </div>
          <div className="h-64 md:h-full min-h-[16rem] relative rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3570.513644974876!2d83.7832004!3d26.5036001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3993c5eed8f3e8a5%3A0x21436dfbacfaba19!2sShivam%20Jewellers!5e0!3m2!1sen!2sin!4v1734595640457!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Elegant Gems Store Location"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
