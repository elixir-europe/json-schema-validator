class CustomAjvError {
  keyword: string;
  message: string;
  params: any;

  constructor(keyword: string, message: string, params: any) {
    this.keyword = keyword;
    this.message = message;
    this.params = params;
  }
}

export default CustomAjvError;