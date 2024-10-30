import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../shadcn/dialog"; // Adjust the import based on your file structure
import VolunteerGroups from "@/components/volunteer/post/VolunteerGroups"; // Adjust the import based on your file structure
import { Button } from "../../../shadcn/button";

export default function GroupSelectionDialog({
  isOpen,
  onClose,
  groups,
  onSelectGroup,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select a Ministry</DialogTitle>
          <DialogDescription>
            Please select a group to view its announcements.
          </DialogDescription>
        </DialogHeader>
        <VolunteerGroups
          groups={groups}
          onSelectGroup={(id) => {
            onSelectGroup(id);
            onClose(); // Close the dialog after selecting a group
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
