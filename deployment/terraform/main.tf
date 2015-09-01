provider "aws" {
    access_key = "${var.access_key}"
    secret_key = "${var.secret_key}"
    region = "${var.aws_region}"
}

resource "terraform_remote_state" "mlabs" {
    backend = "s3"
    config {
        bucket = "mlabs-terraform"
        key = "mlabs/terraform.tfstate"
        region = "us-east-1"
    }
}

resource "terraform_remote_state" "simhotel" {
    backend = "s3"
    config {
        bucket = "mlabs-terraform"
        key = "simhotel/terraform.tfstate"
        region = "us-east-1"
    }
}

resource "aws_route53_record" "factualclient" {
    zone_id = "${terraform_remote_state.mlabs.output.zone}"
    name = "factualclient.marriottlabs.com"
    type = "A"
    ttl = "300"
    records = ["${terraform_remote_state.simhotel.output.devip}"]
}

resource "aws_route53_record" "factualserver" {
    zone_id = "${terraform_remote_state.mlabs.output.zone}"
    name = "factualserver.marriottlabs.com"
    type = "A"
    ttl = "300"
    records = ["${terraform_remote_state.simhotel.output.devip}"]
}

