import React from "react";
import { Card, Button } from "react-bootstrap";

function EducationContentCard({ item }) {
  // Génère la miniature selon le type de contenu
  const getThumbnail = () => {
    switch (item.type) {
      case "VIDÉO":
        if (item.url.includes("youtube.com") || item.url.includes("youtu.be")) {
          let videoId = "";
          if (item.url.includes("youtu.be")) {
            videoId = item.url.split("youtu.be/")[1];
          } else {
            const urlParams = new URLSearchParams(new URL(item.url).search);
            videoId = urlParams.get("v");
          }
          return `https://img.youtube.com/vi/${videoId}/0.jpg`;
        }
        return "/assets/video-placeholder.jpg"; // icône vidéo générique
      case "PDF":
        return "/assets/education/pdf-thumbnail.png"; // icône PDF
      case "ARTICLE":
        return "/assets/education/article-thumbnail.png"; // icône article
      default:
        return "/assets/education/default-content.png"; // icône générique
    }
  };

  return (
    <Card className="h-100">
      <Card.Img
        variant="top"
        src={getThumbnail()}
        height="180"
        style={{ objectFit: "cover" }}
      />
      <Card.Body>
        <Card.Title>{item.titre}</Card.Title>
        <Card.Text>{item.description}</Card.Text>
        <Button variant="success" href={item.url} target="_blank">
          Voir
        </Button>
      </Card.Body>
    </Card>
  );
}

export default EducationContentCard;
