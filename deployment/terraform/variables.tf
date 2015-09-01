variable "aws_region" {
   description = "AWS region to launch resources."
   default = "us-east-1"
}

variable "access_key" {}
variable "secret_key" {}

variable "aws_ubuntu_amis" {
   default = {
      us-east-1 = "ami-9a562df2"
   }
}

variable "key_name" {
   description = "Name of key pair in AWS" 
   default = "mlabs_modus"  
}

variable "key_path" {
   description = "Path to private key portion of key pair."
   default = "~/.ssh/mlabs_modus.pem"
}
