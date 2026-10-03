import { Injectable, PipeTransform } from '@nestjs/common';

/** De-duplicates `permissionIds` on a body so the service gets a clean set. */
@Injectable()
export class NormalizePermissionIdsPipe implements PipeTransform<{
  permissionIds?: string[];
}> {
  transform(body: { permissionIds?: string[] }) {
    if (Array.isArray(body?.permissionIds)) {
      body.permissionIds = [...new Set(body.permissionIds)];
    }
    return body;
  }
}
