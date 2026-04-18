export interface IReview {
  id: number;
  userId: number;
  userName: string;
  foodId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export class ReviewModel {
  id: number;
  userId: number;
  userName: string;
  foodId: number;
  rating: number;
  comment: string;
  createdAt: string;
  date: string;

  constructor(data: IReview) {
    this.id = data.id;
    this.userId = data.userId;
    this.userName = data.userName;
    this.foodId = data.foodId;
    this.rating = data.rating;
    this.comment = data.comment;
    this.createdAt = data.createdAt;

  
    this.date = data.createdAt
      ? new Date(data.createdAt).toLocaleDateString("vi-VN")
      : "";
  }

  
  static fromApi(data: any): ReviewModel {
    return new ReviewModel({
      id: data.id,
      userId: data.userId,
      userName: data.userName,
      foodId: data.foodId,
      rating: data.rating,
      comment: data.comment,
      createdAt: data.createdAt,
    });
  }

  
  static fromApiList(list: any[]): ReviewModel[] {
    return list.map((item) => ReviewModel.fromApi(item));
  }

  
  static calcAverage(reviews: ReviewModel[]): number {
    if (!reviews || reviews.length === 0) return 0;

    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return Number(avg.toFixed(1));
  }
}