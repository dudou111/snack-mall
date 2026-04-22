interface DataType {
    _id?: any,
    key: React.Key;
    name: string;
    bookingID: number;
    IDcard: number;
    tel: number;
    department: string;
    bookingType: string;
    cost: string;
    status: string;
    bookingDate: string;
    waitingTime: string;
    bookingTime: string;
    render?: () => void;

    cardType?: string,
    hospital?: string,
    address?: string,
    doctor?: string,
    doctorType?: string,
    cancelTime?: number,
    tips?: string,
}

