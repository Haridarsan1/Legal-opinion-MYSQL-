'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

// Comprehensive list of major Indian cities
const INDIAN_CITIES = Array.from(
  new Set(
    [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Hyderabad',
      'Ahmedabad',
      'Chennai',
      'Kolkata',
      'Surat',
      'Pune',
      'Jaipur',
      'Lucknow',
      'Kanpur',
      'Nagpur',
      'Indore',
      'Thane',
      'Bhopal',
      'Visakhapatnam',
      'Pimpri-Chinchwad',
      'Patna',
      'Vadodara',
      'Ghaziabad',
      'Ludhiana',
      'Agra',
      'Nashik',
      'Faridabad',
      'Meerut',
      'Rajkot',
      'Kalyan-Dombivli',
      'Vasai-Virar',
      'Varanasi',
      'Srinagar',
      'Aurangabad',
      'Dhanbad',
      'Amritsar',
      'Navi Mumbai',
      'Allahabad',
      'Howrah',
      'Ranchi',
      'Gwalior',
      'Jabalpur',
      'Coimbatore',
      'Vijayawada',
      'Jodhpur',
      'Madurai',
      'Raipur',
      'Kota',
      'Guwahati',
      'Chandigarh',
      'Solapur',
      'Hubli-Dharwad',
      'Mysore',
      'Tiruchirappalli',
      'Bareilly',
      'Aligarh',
      'Tiruppur',
      'Gurgaon',
      'Moradabad',
      'Jalandhar',
      'Bhubaneswar',
      'Salem',
      'Warangal',
      'Mira-Bhayandar',
      'Jalgaon',
      'Guntur',
      'Thiruvananthapuram',
      'Bhiwandi',
      'Saharanpur',
      'Gorakhpur',
      'Bikaner',
      'Amravati',
      'Noida',
      'Jamshedpur',
      'Bhilai',
      'Cuttack',
      'Firozabad',
      'Kochi',
      'Nellore',
      'Bhavnagar',
      'Dehradun',
      'Durgapur',
      'Asansol',
      'Rourkela',
      'Nanded',
      'Kolhapur',
      'Ajmer',
      'Akola',
      'Gulbarga',
      'Jamnagar',
      'Ujjain',
      'Loni',
      'Siliguri',
      'Jhansi',
      'Ulhasnagar',
      'Jammu',
      'Sangli-Miraj & Kupwad',
      'Mangalore',
      'Erode',
      'Belgaum',
      'Ambattur',
      'Tirunelveli',
      'Malegaon',
      'Gaya',
      'Tirupati',
      'Udaipur',
      'Kakinada',
      'Davanagere',
      'Kozhikode',
      'Maheshtala',
      'Rajpur Sonarpur',
      'Rajahmundry',
      'Bokaro',
      'South Dumdum',
      'Bellary',
      'Patiala',
      'Gopalpur',
      'Agartala',
      'Bhagalpur',
      'Muzaffarnagar',
      'Bhatpara',
      'Panihati',
      'Latur',
      'Dhule',
      'Rohtak',
      'Korba',
      'Bhilwara',
      'Berhampur',
      'Muzaffarpur',
      'Ahmednagar',
      'Mathura',
      'Kollam',
      'Avadi',
      'Kadapa',
      'Kamarhati',
      'Sambalpur',
      'Bilaspur',
      'Shahjahanpur',
      'Satara',
      'Bijapur',
      'Rampur',
      'Shivamogga',
      'Chandrapur',
      'Junagadh',
      'Thrissur',
      'Alwar',
      'Bardhaman',
      'Kulti',
      'Nizamabad',
      'Parbhani',
      'Tumkur',
      'Khammam',
      'Ozhukarai',
      'Bihar Sharif',
      'Panipat',
      'Darbhanga',
      'Bally',
      'Aizawl',
      'Dewas',
      'Ichalkaranji',
      'Karnal',
      'Bathinda',
      'Jalna',
      'Eluru',
      'Kirari Suleman Nagar',
      'Barasat',
      'Purnia',
      'Satna',
      'Mau',
      'Sonipat',
      'Farrukhabad',
      'Sagar',
      'Rourkela',
      'Durg',
      'Imphal',
      'Ratlam',
      'Hapur',
      'Arrah',
      'Anantapur',
      'Karimnagar',
      'Etawah',
      'Ambarnath',
      'North Dumdum',
      'Bharatpur',
      'Begusarai',
      'New Delhi',
      'Gandhinagar',
      'Baranagar',
      'Tiruvottiyur',
      'Pondicherry',
      'Sikar',
      'Thoothukudi',
      'Rewa',
      'Mirzapur',
      'Raichur',
      'Pali',
      'Ramagundam',
      'Haridwar',
      'Vijayanagaram',
      'Katihar',
      'Nagarcoil',
      'Sri Ganganagar',
      'Karawal Nagar',
      'Mango',
      'Thanjavur',
      'Bulandshahr',
      'Uluberia',
      'Murwara',
      'Sambhal',
      'Singrauli',
      'Nadiad',
      'Secunderabad',
      'Naihati',
      'Yamunanagar',
      'Bidhan Nagar',
      'Pallavaram',
      'Bidar',
      'Munger',
      'Panchkula',
      'Burhanpur',
      'Raurkela Industrial Township',
      'Kharagpur',
      'Dindigul',
      'Gandhidham',
      'Hospet',
      'Nangloi Jat',
      'Malda',
      'Ongole',
      'Deoghar',
      'Chapra',
      'Haldia',
      'Khandwa',
      'Nandyal',
      'Chittoor',
      'Morena',
      'Amroha',
      'Anand',
      'Bhind',
      'Bhalswa Jahangir Pur',
      'Madhyamgram',
      'Bhiwani',
      'Navi Mumbai',
      'Baharampur',
      'Ambala',
      'Morvi',
      'Fatehpur',
      'Rae Bareli',
      'Khora',
      'Bhusawal',
      'Orai',
      'Bahraich',
      'Vellore',
      'Mahesana',
      'Sambalpur',
      'Raiganj',
      'Sirsa',
      'Danapur',
      'Serampore',
      'Sultan Pur Majra',
      'Guna',
      'Jaunpur',
      'Panvel',
      'Shivpuri',
      'Surendranagar Dudhrej',
      'Unnao',
      'Hugli and Chinsurah',
      'Alappuzha',
      'Kottayam',
      'Shimla',
      'Karaikudi',
    ].sort()
  )
).sort();

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter city...',
  className = '',
  required = false,
  disabled = false,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);

    if (query.length > 0) {
      const filtered = INDIAN_CITIES.filter((city) =>
        city.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelectCity = (city: string) => {
    onChange(city);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value && suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
          required={required}
          disabled={disabled}
          suppressHydrationWarning
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelectCity(city)}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
